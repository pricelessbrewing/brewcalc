// @flow
import type { Recipe } from './types/recipe'
import { sum, kgToOunces, litersToGallons } from './utils.js'
import type { Hop } from './types/hop'
import { HopForms } from './types/hop'

const ibuUtilization = (
  avgBoilGravityPts: number,
  boilTime: number,
  pelletFactor: number
) =>
  pelletFactor *
  1.65 *
  Math.pow(0.000125, avgBoilGravityPts) *
  (1 - Math.pow(Math.E, -0.04 * boilTime)) /
  4.15

//Glenn Tinseth developed the following formula to calculate bitterness in IBUs:
//IBU = (U * ozs hops * 7490)/Volume (in gallons) U represents the utilization of the hops (conversion to iso-alpha-acids) based on boil time and wort gravity.
//U = bigness factor * boil time factor

export const bitternessIbuTinseth = (
  { hops }: Recipe,
  avgBoilGravityPts: number,
  postBoilVolume: number
) =>
  sum(
    hops.map(
      ({ amount, alpha, form, time }) =>
        ibuUtilization(
          avgBoilGravityPts,
          time,
          form === HopForms.pellet ? 1.1 : 1
        ) *
        kgToOunces(amount) *
        alpha *
        7490 /
        litersToGallons(postBoilVolume)
    )
  )

//The preceived bitterness expressed in a ratio of IBUs to gravity. This is frequently seen expressed as BU/GU.
//The Gravity Units are the decimal portion of the original gravity
export const bitternessRatio = (ibu: number, gu: number) => ibu / gu

//rager
const ragerHopGravityAdjustment = sgb => sgb <= 1.050 ? 0 : (sgb - 1.050) / 0.2
const ragerUtil = time => 18.11 + 13.86 * Math.tanh((time - 31.32) / 18.27)

const ragerHopIbuFromWeight = (util, alpha, wt, vol, ga, wtFactor) =>
  util * alpha * wt * wtFactor / (vol * (1.0 + ga))

export const ragerHopIbu = (
  amount: number,
  alpha: number,
  time: number,
  sg: number,
  vol: number
) =>
  time <= 0.0 || amount <= 0.0 || alpha < 0.0
    ? 0
    : ragerHopIbuFromWeight(
        ragerUtil(Math.floor(time + 0.5)) * 0.01,
        alpha,
        amount,
        vol,
        ragerHopGravityAdjustment(sg),
        100.0 / 1.34
      )

export const bitternessIbuRager = (
  { hops }: Recipe,
  avgBoilGravityPts: number,
  postBoilVolume: number
) =>
  sum(
    hops.map(({ amount, alpha, time }: Hop) =>
      ragerHopIbu(
        kgToOunces(amount),
        alpha * 100,
        time,
        avgBoilGravityPts,
        litersToGallons(postBoilVolume)
      ))
  )

//garetz
//http://www.straighttothepint.com/ibu-calculator/
const garetz_hop_ibu = (amount, alpha, time, og, batchSize, boilSize) => {
  if (time <= 0 || amount <= 0 || alpha < 0) return 0

  const cf = batchSize / boilSize
  const bg = cf * (og - 1) + 1
  const gf = (bg - 1.050) / 0.2 + 1.0

  //TF = ((Elevation in feet) / 550) * 0.02) + 1
  const tf = 1.2

  let ibu_guess = 1.0
  let ibu = 50

  while (Math.abs(ibu_guess - ibu) > 0.05) {
    ibu_guess = ibu
    const utilization = 7.2994 + 15.0746 * Math.tanh((time - 21.86) / 24.71)
    const hf = cf * ibu_guess / 260 + 1
    const ca = gf * hf * tf
    ibu = utilization * alpha * amount * 0.749 / (batchSize * ca)
  }

  return ibu
}

export const bitternessIbuGaretz = (
  { hops }: Recipe,
  boilingGravity: number,
  batchSize: number,
  boilVolume: number
) =>
  sum(
    hops.map(({ amount, alpha, time }: Hop) =>
      garetz_hop_ibu(
        kgToOunces(amount),
        alpha * 100,
        time,
        boilingGravity,
        litersToGallons(batchSize),
        litersToGallons(boilVolume)
      ))
  )
