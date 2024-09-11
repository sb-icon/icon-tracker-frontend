import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import TransactionEvents from './TransactionEvents'
import TransactionInternalTransactions from './TransactionInternalTransactions'
import { NoBox, TabTable, TabTable2 } from '../../../../components'
import { TX_TYPE, TRANSACTION_TABS } from '../../../../utils/const'

class TransactionTabs extends Component {
    render() {
        const { on, transaction, transactionEvents, transactionInternalTx } = this.props
        const { loading, data } = transaction
        const { loading: loadingE, data: dataE } = transactionEvents
        const { loading: loadingI, data: dataI } = transactionInternalTx
        const { hash } = data

        let TABS = []

        if (dataI && dataI.length > 0) {
            TABS.push(TRANSACTION_TABS[0])
        }

        if (dataE && dataE.length > 0) {
            TABS.push(TRANSACTION_TABS[1])
        }

        if (TABS.length < 1) {
            return null
        }
        TABS = TRANSACTION_TABS
        return (
            <TabTable2
                {...this.props}
                onClickTab={this.props.changeTab}
                TABS={TABS}
                on={on}
                loading={loading && loadingE && loadingI}
                TableContents={(on) => {
                    switch (on) {
                        case 0:
                            return (
                                <TransactionInternalTransactions
                                    txData={transactionInternalTx}
                                    goAllTx={() => {
                                        this.props.history.push(
                                            `/${TX_TYPE.TRANSACTION_INTERNAL_TX}/${hash}`
                                        )
                                    }}
                                    txType={TX_TYPE.TRANSACTION_INTERNAL_TX}
                                />
                            )
                        case 1:
                            return (
                                <TransactionEvents
                                    txData={transactionEvents}
                                    goAllTx={() => {
                                        this.props.history.push(
                                            `/${TX_TYPE.TRANSACTION_EVENTS}/${hash}`
                                        )
                                    }}
                                    txType={TX_TYPE.TRANSACTION_EVENTS}
                                />
                            )
                        default:
                            return <NoBox text="No Data" />
                    }
                }}
            />
        )
    }
}

export default withRouter(TransactionTabs)
