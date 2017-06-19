// @flow
declare var test: any;
declare var expect: any;
import {
  bitternessIbuTinseth,
  bitternessRatio,
  bitternessIbuRager,
  bitternessIbuGaretz
} from '../hops'
import { originalGravity, gravityPoints, finalGravity } from '../brewcalc'
import { calculateVolumes } from '../volumes'
import { recipe as AussieAle } from './data/AussieAle.js'
import { equipment as AussieAleEquipment } from './data/AussieAle.js'

test('bitternessIbuTinseth', () => {
  const ogPts = originalGravity(
    AussieAle.batchSize,
    gravityPoints(AussieAle, AussieAleEquipment)
  ) - 1

  const fgPts = finalGravity(
    AussieAle.batchSize,
    gravityPoints(
      AussieAle,
      AussieAleEquipment,
      AussieAle.yeasts[0].attenuation
    )
  ) - 1

  const avgBoilGravityPts = (ogPts + fgPts) / 2

  expect(
    bitternessIbuTinseth(
      AussieAle,
      avgBoilGravityPts,
      AussieAleEquipment.batchSize + AussieAleEquipment.trubChillerLoss
    )
  ).toBeCloseTo(28, 0)
})

test('bitternessRatio', () => {
  const ogPts = originalGravity(
    AussieAle.batchSize,
    gravityPoints(AussieAle, AussieAleEquipment)
  ) - 1

  const fgPts = finalGravity(
    AussieAle.batchSize,
    gravityPoints(
      AussieAle,
      AussieAleEquipment,
      AussieAle.yeasts[0].attenuation
    )
  ) - 1

  const avgBoilGravityPts = (ogPts + fgPts) / 2

  const ibu = bitternessIbuTinseth(
    AussieAle,
    avgBoilGravityPts,
    AussieAleEquipment.batchSize + AussieAleEquipment.trubChillerLoss
  )

  const gu = ogPts * 1000
  expect(bitternessRatio(ibu, gu)).toBeCloseTo(0.64, 0)
})

test('bitternessIbuRager', () => {
  const ogPts = originalGravity(
    AussieAle.batchSize,
    gravityPoints(AussieAle, AussieAleEquipment)
  ) - 1

  const fgPts = finalGravity(
    AussieAle.batchSize,
    gravityPoints(
      AussieAle,
      AussieAleEquipment,
      AussieAle.yeasts[0].attenuation
    )
  ) - 1

  const avgBoilGravityPts = (ogPts + fgPts) / 2

  expect(
    bitternessIbuRager(
      AussieAle,
      avgBoilGravityPts,
      AussieAleEquipment.batchSize + AussieAleEquipment.trubChillerLoss
    )
  ).toBeCloseTo(21, 0)
  //22.2 by beerSmith, I suppose that there is additional ajustments depends of the Hop form
})

test('bitternessIbuGaretz', () => {
  const ogAussieAle = originalGravity(
    AussieAle.batchSize,
    gravityPoints(AussieAle, AussieAleEquipment)
  )
  expect(
    bitternessIbuGaretz(
      AussieAle,
      ogAussieAle,
      AussieAleEquipment.batchSize,
      calculateVolumes(AussieAle, AussieAleEquipment).estPreBoilVolume
    )
  ).toBeCloseTo(28, 0)
})
