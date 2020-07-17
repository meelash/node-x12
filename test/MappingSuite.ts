'use strict'

import 'mocha'
import { X12Parser, X12Transaction, X12TransactionMap, X12Interchange } from '../core'

import fs = require('fs')

const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
const mapJson = fs.readFileSync('test/test-data/850_map.json', 'utf8')
const resultJson = fs.readFileSync('test/test-data/850_map_result.json', 'utf8')
const transactionJson = fs.readFileSync('test/test-data/Transaction_map.json', 'utf8')
const transactionData = fs.readFileSync('test/test-data/Transaction_data.json', 'utf8')

describe('X12Mapping', () => {
  it('should map transaction to data', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const transaction = interchange.functionalGroups[0].transactions[0]
    const mapper = new X12TransactionMap(JSON.parse(mapJson), transaction)
    const result = JSON.stringify(mapper.toObject())

    if (result !== resultJson) {
      throw new Error(`Formatted JSON does not match source. Found ${result}, expected ${resultJson}.`)
    }
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
      throw new Error(`An error occured when mapping an object to a transaction.`)
    }
  })
})
