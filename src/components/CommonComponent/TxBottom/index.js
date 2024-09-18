import React, { Component } from 'react'
import TxBottomComponent from './TxBottomComponent'
import { TX_TYPE_DATA } from '../../../utils/const'

class TxBottom extends Component {
    render() {
        const { txData, goAllTx, txType, address, tokenTotal, onClickTab, wallet, walletAddress } =
            this.props


        const tableClassName = TX_TYPE_DATA[txType] ? TX_TYPE_DATA[txType]['className'] : ''

        const noBoxText = TX_TYPE_DATA[txType] ? TX_TYPE_DATA[txType]['noBoxText'] : ''

        console.log("props in txBottom", this.props);

        return (
            <TxBottomComponent
                noBorder={true}
                txData={txData}
                goAllTx={goAllTx}
                txType={txType}
                address={address}
                wallet={wallet}
                tableClassName={tableClassName}
                noBoxText={noBoxText}
                tokenTotal={tokenTotal}
                total={this.props.total}
                bondMap={this.props.bondMap ? this.props.bondMap : ''}
                onClickTab={onClickTab}
                walletAddress={walletAddress}
                isBondingModalOpen={this.props.isBondingModalOpen}
            />
        )
    }
}

export default TxBottom
