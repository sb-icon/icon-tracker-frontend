// rawTxMaker/api/governance.js
//
// Imports
import { scores, makeTxCallRPCObj } from './helpers'

// Governance methods
/*
 *
 */
async function voteNetworkProposal(proposalId, vote, prepAddress, nid, sl = 200000000) {
    return await makeTxCallRPCObj(
        prepAddress,
        scores.mainnet.governance2,
        'voteProposal',
        {
            id: proposalId,
            vote: vote,
        },
        nid,
        sl
    )
}

async function applyNetworkProposal(proposalId, prepAddress, nid, sl = 20000000000) {
    return await makeTxCallRPCObj(
        prepAddress,
        scores.mainnet.governance2,
        'applyProposal',
        {
            id: proposalId,
        },
        nid,
        sl
    )
}
/*
 *
 */
async function approveNetworkProposal(proposalId, prepAddress, nid) {
    return await voteNetworkProposal(proposalId, '0x1', prepAddress, nid)
}

/*
 *
 */
async function rejectNetworkProposal(proposalId, prepAddress, nid) {
    return await voteNetworkProposal(proposalId, '0x0', prepAddress, nid)
}

// 12500000000
async function submitNetworkProposal(from, params, nid, sl = 20000000000) {
    return await makeTxCallRPCObj(
        from,
        scores.mainnet.governance2,
        'registerProposal',
        params,
        nid,
        sl,
        100
    )
}

const governanceMethods = {
    voteNetworkProposal,
    approveNetworkProposal,
    rejectNetworkProposal,
    submitNetworkProposal,
    applyNetworkProposal,
}
export default governanceMethods
