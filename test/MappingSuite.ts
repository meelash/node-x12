'use strict'

import 'mocha'
import { X12Parser, X12Transaction, X12TransactionMap, X12Interchange } from '../core'
import * as fs from 'fs'
import * as assert from 'assert'

const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
const mapJson = fs.readFileSync('test/test-data/850_map.json', 'utf8')
const resultJson = fs.readFileSync('test/test-data/850_map_result.json', 'utf8')
const transactionJson = fs.readFileSync('test/test-data/Transaction_map.json', 'utf8')
const transactionJsonLiquid = fs.readFileSync('test/test-data/Transaction_map_liquidjs.json', 'utf8')
const transactionData = fs.readFileSync('test/test-data/Transaction_data.json', 'utf8')

describe('X12Mapping', () => {
  it('should map transaction to data', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const transaction = interchange.functionalGroups[0].transactions[0]
    const mapper = new X12TransactionMap(JSON.parse(mapJson), transaction)

    assert.deepStrictEqual(mapper.toObject(), JSON.parse(resultJson))
  })

  it('should map data to transaction with custom macro', () => {
    const transaction = new X12Transaction()
    const mapper = new X12TransactionMap(JSON.parse(transactionJson), transaction)
    const data = JSON.parse(transactionData)
    const result = mapper.fromObject(data, {
      toFixed: function toFixed (key: string, places: number) {
        return {
          val: parseFloat(key).toFixed(places)
        }
      }
    })

    if (!(result instanceof X12Transaction)) {
      throw new Error('An error occured when mapping an object to a transaction.')
    }
  })

  it('should map data to transaction with LiquidJS', () => {
    const transaction = new X12Transaction()
    const mapper = new X12TransactionMap(JSON.parse(transactionJsonLiquid), transaction, 'liquidjs')
    const data = JSON.parse(transactionData)
    const result = mapper.fromObject(data, {
      to_fixed: (value: string, places: number) => parseFloat(value).toFixed(places)
    })

    if (!(result instanceof X12Transaction)) {
      throw new Error('An error occured when mapping an object to a transaction.')
    }
  })
  it('should return null for nonexistent values when using FOREACH', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const transaction = interchange.functionalGroups[0].transactions[0]

    const mapper1 = new X12TransactionMap({ TestKey: 'PR03' }, transaction)
    const wOutFOREACH = mapper1.toObject()

    const mapper2 = new X12TransactionMap({ TestFOREACH: 'FOREACH(PO1)=>PO102', TestKey: 'PR03' }, transaction)
    const wFOREACHFirst = mapper2.toObject()

    const mapper3 = new X12TransactionMap({ TestKey: 'PR03', TestFOREACH: 'FOREACH(PO1)=>PO102' }, transaction)
    const wFOREACHAfter = mapper3.toObject()

    if (wOutFOREACH.TestKey !== wFOREACHFirst.TestKey || wFOREACHFirst.TestKey !== wFOREACHAfter.TestKey) {
      throw new Error('Got different result based on location of FOREACH. Expected the same result no matter what.')
    }
  })
})
