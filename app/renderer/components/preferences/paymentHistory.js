/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const Immutable = require('immutable')
const ImmutableComponent = require('../../../../js/components/immutableComponent')
const {StyleSheet, css} = require('aphrodite')
const globalStyles = require('../styles/global')
const {addExportFilenamePrefixToTransactions} = require('../../../common/lib/ledgerExportUtil')
const appUrlUtil = require('../../../../js/lib/appUrlUtil')
const aboutUrls = appUrlUtil.aboutUrls
const aboutContributionsUrl = aboutUrls.get('about:contributions')
const moment = require('moment')
moment.locale(navigator.language)

class PaymentHistory extends ImmutableComponent {
  render () {
    const transactions = Immutable.fromJS(
        addExportFilenamePrefixToTransactions(this.props.ledgerData.get('transactions').toJS())
    )

    return <table className={css(styles.paymentHistoryTable)}>
      <thead>
        <tr className={css(styles.rowContainer, styles.headerContainer)}>
          <th className={css(styles.header, styles.narrow)} data-l10n-id='date' />
          <th className={css(styles.header, styles.medium)} data-l10n-id='totalAmount' />
          <th className={css(styles.header, styles.wide)} data-l10n-id='receiptLink' />
        </tr>
      </thead>
      <tbody>
        {
          transactions.map(row => <PaymentHistoryRow transaction={row} ledgerData={this.props.ledgerData} />)
        }
      </tbody>
    </table>
  }
}

class PaymentHistoryRow extends ImmutableComponent {
  get transaction () {
    return this.props.transaction
  }

  get formattedDate () {
    const timestamp = this.transaction.get('submissionStamp')
    return moment(new Date(timestamp)).format('YYYY-MM-DD')
  }

  get satoshis () {
    return this.transaction.getIn(['contribution', 'satoshis'])
  }

  get currency () {
    return this.transaction.getIn(['contribution', 'fiat', 'currency'])
  }

  get totalAmount () {
    const fiatAmount = this.transaction.getIn(['contribution', 'fiat', 'amount'])
    return (fiatAmount && typeof fiatAmount === 'number' ? fiatAmount.toFixed(2) : '0.00')
  }

  get viewingId () {
    return this.transaction.get('viewingId')
  }

  get receiptFileName () {
    return `${this.transaction.get('exportFilenamePrefix')}.pdf`
  }

  get totalAmountStr () {
    return `${this.totalAmount} ${this.currency}`
  }

  render () {
    return <tr className={css(styles.rowContainer, styles.rowData)}>
      <td className={css(styles.column, styles.narrow)} data-sort={this.timestamp}>{this.formattedDate}</td>
      <td className={css(styles.column, styles.medium)} data-sort={this.satoshis}>{this.totalAmountStr}</td>
      <td className={css(styles.column, styles.wide)}>
        <a href={`${aboutContributionsUrl}#${this.viewingId}`} target='_blank'>{this.receiptFileName}</a>
      </td>
    </tr>
  }
}

const styles = StyleSheet.create({
  paymentHistoryTable: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    borderSpacing: '0',
    margin: '1em 0'
  },

  headerContainer: {
    borderBottom: `2px solid ${globalStyles.color.lightGray}`
  },

  header: {
    display: 'flex',
    color: globalStyles.color.darkGray,
    fontWeight: '500',
    paddingBottom: '.25em'
  },

  rowContainer: {
    display: 'flex',
    flex: '1'
  },

  rowData: {
    ':nth-child(even)': {
      backgroundColor: globalStyles.color.veryLightGray
    },
    ':hover': {
      backgroundColor: globalStyles.color.defaultIconBackground
    }
  },

  column: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    height: '1.5em',
    padding: '.125em 0'
  },

  narrow: {
    color: globalStyles.color.darkGray,
    justifyContent: 'center',
    flex: '2'
  },

  medium: {
    color: globalStyles.color.darkGray,
    flex: '3'
  },

  wide: {
    color: '#777',
    flex: '4'
  }
})

module.exports = PaymentHistory
