import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './bondersUpdateModal.module.css'
import GenericModal from '../GenericModal/genericModal'
import { chainMethods } from '../../utils/rawTxMaker'
import { getBonders } from '../../redux/store/iiss'
import { requestJsonRpc } from '../../utils/connect'
import utils from '../../utils/utils2'
import config from '../../config'

const { nid } = config

// Constants
const { setBonderList } = chainMethods

const initBonderForm = {
    bonder1: '',
    bonder2: '',
    bonder3: '',
    bonder4: '',
    bonder5: '',
    bonder6: '',
    bonder7: '',
    bonder8: '',
    bonder9: '',
    bonder10: '',
}

const { parseBonderFormInputs, isValidICONAddress, getInitialBonderState } = utils

export default function BondersModal({ bondMap, address, isOpen, onClose }) {
    const [bonderListState, setBonderListState] = useState([])
    const [bonderForm, setBonderForm] = useState(initBonderForm)
    const [txResponse, setTxResponse] = useState('')

    function handleFormInputChange(evnt) {
        const { value, name } = evnt.target

        setBonderForm((bonderState) => {
            let newState = { ...bonderState }
            newState[name] = value

            return newState
        })
    }

    function handleOnClose() {
        setTxResponse('')
        onClose()
    }

    function handleBonderFormSubmit() {
        handleFormSubmit('bond')
    }

    async function handleFormSubmit(type) {
        setTxResponse('')
        let inputData = null
        let txData = null

        switch (type) {
            case 'bond':
                inputData = parseBonderFormInputs(bonderForm)
                if (inputData == null || inputData.length === 0) {
                } else {
                    txData = await setBonderList(address, inputData, nid)
                }
                break
            default:
                break
        }

        // dispatch event to wallet
        if (txData == null) {
            alert('Data for transaction is invalid')
        } else {
            try {
                console.log('JSON RPC request')
                console.log(txData)
                const walletResponse = await requestJsonRpc(txData.params)
                console.log('wallet response')
                console.log(walletResponse)
                if (walletResponse.result != null) {
                    setTxResponse(walletResponse.result)
                } else if (walletResponse.error != null) {
                    if (typeof walletResponse.error === 'string') {
                        setTxResponse(walletResponse.error)
                    } else if (typeof walletResponse.error === 'object') {
                        if (walletResponse.error.message != null) {
                            setTxResponse(walletResponse.error.message)
                        } else {
                            setTxResponse(JSON.stringify(walletResponse.error))
                        }
                    } else {
                        throw new Error('Unknown error')
                    }
                } else {
                    throw new Error('Unknown error')
                }
            } catch (e) {
                console.log('error from wallet')
                console.log(e)
                if (typeof e === 'string') {
                    setTxResponse(e)
                } else if (typeof e === 'object' && e.message != null) {
                    setTxResponse(e.message)
                } else {
                    setTxResponse(JSON.stringify(e))
                }
            }
        }
    }

    useEffect(() => {
        async function getBondersData() {
            const payload = { address }
            const bonderListData = await getBonders(payload)

            if (bonderListData != null && bonderListData.length != null) {
                const initBonderState = getInitialBonderState(bonderListData)
                console.log('initBonderState')
                console.log(initBonderState)
                setBonderListState(bonderListData)
                setBonderForm(initBonderState)
            }
        }
        if (bondMap != null) {
            if (address != null) {
                getBondersData()
            }
        }
    }, [bondMap])

    return (
        <div>
            {bondMap != null ? (
                <GenericModal isOpen={isOpen} onClose={handleOnClose} useSmall={true}>
                    <div>
                        <div className={styles.main}>
                            <div className={styles.defaultSection}>
                                <h2>Bonders Info:</h2>
                                <p>
                                    A maximum of 10 addresses are allowed to be added to the{' '}
                                    <i>bonderList</i> of your node.
                                </p>
                                <p>
                                    You can use the following form to update your <i>bonderList</i>{' '}
                                    configuration, a transaction will be signed with your address
                                    using your preferred wallet software, the details of the
                                    transaction will be shown in the wallet popup window before
                                    approving the transaction.
                                </p>
                                <div className={styles.setPrepForm}>
                                    <div className={styles.table}>
                                        {[
                                            ['bonder1', bonderForm.bonder1, 'Bonder 1:'],
                                            ['bonder2', bonderForm.bonder2, 'Bonder 2:'],
                                            ['bonder3', bonderForm.bonder3, 'Bonder 3:'],
                                            ['bonder4', bonderForm.bonder4, 'Bonder 4:'],
                                            ['bonder5', bonderForm.bonder5, 'Bonder 5:'],
                                            ['bonder6', bonderForm.bonder6, 'Bonder 6:'],
                                            ['bonder7', bonderForm.bonder7, 'Bonder 7:'],
                                            ['bonder8', bonderForm.bonder8, 'Bonder 8:'],
                                            ['bonder9', bonderForm.bonder9, 'Bonder 9:'],
                                            ['bonder10', bonderForm.bonder10, 'Bonder 10:'],
                                        ].map((arrItem, index) => {
                                            return (
                                                <div
                                                    key={`bonder-item-${index}`}
                                                    className={styles.tableRow}>
                                                    <p className={styles.tableRowLabel}>
                                                        <b>{arrItem[2]}</b>
                                                    </p>
                                                    <input
                                                        type="text"
                                                        name={arrItem[0]}
                                                        value={arrItem[1]}
                                                        onChange={handleFormInputChange}
                                                        placeholder={bonderListState[index] || ''}
                                                        className={
                                                            isValidICONAddress(arrItem[1]) === true
                                                                ? `${styles.tableRowInput} ${styles.tableRowInputValid}`
                                                                : `${styles.tableRowInput} ${styles.tableRowInputInvalid}`
                                                        }
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <button className={styles.button} onClick={handleBonderFormSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                        {txResponse != null && txResponse !== '' ? (
                            <p>
                                Result:{' '}
                                <Link to={`/transaction/${txResponse}`}>
                                    <em style={{ fontSize: '12px' }}>{txResponse}</em>
                                </Link>
                            </p>
                        ) : (
                            <></>
                        )}
                    </div>
                </GenericModal>
            ) : (
                <></>
            )}
        </div>
    )
}
