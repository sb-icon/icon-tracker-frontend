import React, { Component, } from 'react';
import { withRouter } from 'react-router-dom'
import { numberWithCommas, convertNumberToText } from '../../utils/utils'
import { IconConverter, IconAmount } from 'icon-sdk-js'
import { getLastBlock, getStepPrice, getPublicTreasury, prepList, getPRepsRPC, getTotalSupply, queryNetworkInfo } from '../../redux/store/iiss'
import { getPReps, getIISSInfo, icxCall } from '../../redux/api/restV3';
import {
    LoadingComponent,
} from '../../components'
import { POPUP_TYPE } from '../../utils/const'
import { getTrackerApiUrl } from '../../redux/api/restV3/config';
import { GetAddressForPrepList } from '../../utils/const';
import styles from "./index.module.css";

class GovernancePage extends Component {

    state = {
        activePreps: [],
        totalSupply: 0,
        publicTreasury: 0,
        totalStaked: 0,
        totalVoted: 0,
        irep: 0,
        rrep: 0,
        glbComRate: 0,
        height: 0,
        stepPrice: 0,
        mainChecked: true,
        subChecked: true,
        restChecked: true,
        blackChecked: false,
        allPrep: [],
        blackPrep: [],
        lastBlockPrepName: "",
        search: '',
        loading: true
    }

    checkedState = {}
    getAdditionalData = async method => {
        const network = await getTrackerApiUrl()
        const address = GetAddressForPrepList[network]
        const params = {
            to: address,
            dataType: 'call',
            data: {
                method: method
            }
        }
        const response = await icxCall(params);
        return response;
    }

    governanceData = [];
    statusList = []

    async componentDidMount() {
        try {
            const [
                { data: preps = [] },
                { totalStake: totalStakedLoop = 0, totalDelegated: totalVotedLoop = 0 },
                { height = null, peer_id: lastPeerId = "" } = {},
                stepPriceLoop = 0,
                _blackPrep = [],
                totalSupplyRaw = 0,
                IISSData = {},
                networkInfo
            ] = await Promise.all([
                getPReps(),
                getPRepsRPC(),
                getLastBlock(),
                getStepPrice(),
                prepList(3),
                getTotalSupply(),
                getIISSInfo(),
                queryNetworkInfo()
            ]);



            this.publicTreasury = await getPublicTreasury();
            this.governanceData = preps ?? [];

            const icxSupply = Number(totalSupplyRaw) / 1e18;

            const iGlobalDecimal = Number(IISSData.variable.Iglobal, 16) / 1e18;
            const iPrepDecimal = Number(IISSData.variable.Iprep, 16) / 10000;
            const totalPowerDecimal = parseInt(networkInfo.totalPower, 16) / 1e18;
            const STAKING_AMOUNT = 10000;

            const allPrep = preps.map(prep => {
                const matchingPrep = preps.find(p => p.address === prep.address);

                if (matchingPrep) {
                    prep.stake = IconAmount.of(matchingPrep.stake ?? 0, IconAmount.Unit.LOOP)
                        .convertUnit(IconAmount.Unit.ICX)
                        .value.toString(10);

                    prep.unstake = IconAmount.of(matchingPrep.unstake ?? 0, IconAmount.Unit.LOOP)
                        .convertUnit(IconAmount.Unit.ICX)
                        .value.toString(10);
                }


                const prepCommissRate = prep.commission_rate !== null ? prep.commission_rate / 100 : prep.commission_rate;
                const prepPower = prep.power / 10 ** 18
                const prepDelegated = prep.delegated
                const fromIprep =
                    (prepPower * iGlobalDecimal * iPrepDecimal) / totalPowerDecimal;
                const totalStakersRewards = prepCommissRate !== null ? fromIprep * (1 - prepCommissRate) : fromIprep;
                const monthlyStakersRewards = totalStakersRewards * (STAKING_AMOUNT / (prepDelegated + STAKING_AMOUNT))

                prep.balance = Number(prep.balance ?? 0);
                prep.apr = ((monthlyStakersRewards * 12) / STAKING_AMOUNT) * 100

                return prep
            });

            const blackPrep = _blackPrep.map(bp => ({
                ...bp,
                grade: 3,
                status: bp.penaltyStatus
            }));

            const lastPrepIndex = allPrep.findIndex(prep => prep.address === lastPeerId);
            const lastBlockPrepName = lastPrepIndex === -1
                ? ""
                : `#${lastPrepIndex + 1} ${allPrep[lastPrepIndex]?.name ?? ""}`;

            const totalSupply = icxSupply || 0;
            const totalStaked = totalStakedLoop
                ? IconConverter.toNumber(
                    IconAmount.of(totalStakedLoop, IconAmount.Unit.LOOP)
                        .convertUnit(IconAmount.Unit.ICX)
                        .value.toString(10)
                )
                : 0;

            const totalVoted = totalVotedLoop
                ? IconConverter.toNumber(
                    IconAmount.of(totalVotedLoop, IconAmount.Unit.LOOP)
                        .convertUnit(IconAmount.Unit.ICX)
                        .value.toString(10)
                )
                : 0;

            const stepPrice = IconAmount.of(stepPriceLoop, IconAmount.Unit.LOOP)
                .convertUnit(IconAmount.Unit.ICX)
                .value.toString(10);

            this.setState({
                loading: false,
                totalSupply,
                totalStaked,
                totalVoted,
                height,
                stepPrice,
                allPrep,
                blackPrep,
                lastBlockPrepName,
                Iwage: IISSData.variable.Iwage,
                Irelay: IISSData.variable.Irelay,
                Icps: IISSData.variable.Icps,
                Iglobal: Number(IISSData.variable.Iglobal) / 1e18,
                Iprep: IISSData.variable.Iprep
            });
        } catch (error) {
            console.error("Error loading data:", error);
            this.setState({ loading: false });
        }
    }



    handleChange = e => {
        const { type, value } = e.target
        switch (type) {
            case 'checkbox':
                if (value === 'main') {
                    this.setState({
                        mainChecked: !this.state.mainChecked,
                        blackChecked: false,
                    })
                }
                else if (value === 'sub') {
                    this.setState({
                        subChecked: !this.state.subChecked,
                        blackChecked: false,
                    })
                }
                else if (value === 'rest') {
                    this.setState({
                        restChecked: !this.state.restChecked,
                        blackChecked: false,
                    })
                }
                else if (value === 'black') {
                    if (this.state.blackChecked) {
                        this.setState({
                            blackChecked: false,
                            ...this.checkedState,
                        })
                    }
                    else {
                        const {
                            mainChecked,
                            subChecked,
                            restChecked
                        } = this.state

                        this.checkedState = {
                            mainChecked,
                            subChecked,
                            restChecked
                        }

                        this.setState({
                            blackChecked: true,
                            mainChecked: false,
                            subChecked: false,
                            restChecked: false
                        })
                    }
                }
                return
            case 'text':
                this.setState({ search: value })
                return
            default:
        }
    }
    getGovernanceStatus = (address) => {
        let result = false;
        this.governanceData?.data?.forEach(item => {
            if (item.address === address) {
                result = true;
            }
        })
        return result
    }
    render() {
        const {
            totalSupply,
            totalStaked,
            totalVoted,
            irep,
            rrep,
            glbComRate,
            height,
            stepPrice,
            allPrep,
            blackPrep,
            lastBlockPrepName,
            search,
            loading,
            mainChecked,
            subChecked,
            restChecked,
            blackChecked
        } = this.state

        // Deprecated?
        // const icxPublicTreasuryStr = this.state.supplyMetrics ? numberWithCommas(Math.floor(this.state.supplyMetrics.data.circulating_supply / Math.pow(10, 18))) : 0;

        const totalStakedRate = !totalSupply ? '-' : totalStaked / totalSupply * 100
        const totalVotedRate = !totalSupply ? '-' : totalVoted / totalSupply * 100


        const list = blackChecked ? blackPrep : allPrep.filter(p => {
            return (
                mainChecked && (p.grade === 0 || p.grade === '0x0'))
                || (subChecked && (p.grade === 1 || p.grade === '0x1'))
                || (restChecked && (p.grade === 2 || p.grade === '0x2'))
            // || (p.grade === 3 || p.grade === "0x3")
        })


        let searched = search ? list
            .filter(prep =>
                prep.name.toLowerCase().includes(search.toLowerCase().trim())
                || prep.address.toLowerCase().includes(search.trim())
            )
            : list;

        searched.sort((a, b) => {
            return b.power - a.power;
        });

        return (
            <div className="content-wrap governance">
                <div className="screen0">
                    {loading && <LoadingComponent height='400px' />}
                    {!loading && <div className="wrap-holder">
                        <p className="title">Governance<span onClick={() => { this.props.setPopup({ type: POPUP_TYPE.ABOUT }) }}><i className="img"></i>About Governance</span></p>
                        <div className="contents">
                            <div className="graph">
                                <div className="txt"><span><i className="img"></i>Total Supply : {convertNumberToText(totalSupply, 0)}</span><span><i className="img"></i>Staked : {convertNumberToText(totalStaked, 0)}</span><span><i className="img"></i>Voted : {convertNumberToText(totalVoted, 0)}</span></div>
                                <div className="bar-group">
                                    <div className="bar" style={{ width: "100%" }}><span>100<em>%</em></span></div>
                                    <div className={`bar${totalStakedRate - totalVotedRate < 11 ? ' small' : ''}`} style={{ width: `${totalStakedRate}%` }}>{totalStakedRate > 8 && <span>{totalStakedRate.toFixed(2)}<em>%</em></span>}</div>
                                    <div className="bar" style={{ width: `${totalVotedRate}%` }}>{totalVotedRate > 8 && <span>{totalVotedRate.toFixed(2)}<em>%</em></span>}</div>
                                </div>
                                <div className="total">
                                    <p>Public Treasury <em>(ICX)</em></p>
                                    <p><span>{numberWithCommas(Number(this.publicTreasury / Math.pow(10, 18)).toFixed(0))}</span></p>


                                </div>
                            </div>
                            <ul>
                                <li>
                                    <div>
                                        <p>Prep Reward Rate <em>(%)</em></p>
                                        <p><span>{Number(this.state.Iprep / 100)}</span></p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p>CPS Reward Rate <em>(%)</em></p>
                                        <p><span>{Number(this.state.Icps / 100)}</span></p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p>Prep Wage <em>(%)</em>
                                        </p>
                                        <p><span>{Number(this.state.Iwage) / 100}</span></p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p>Monthly Inflation <em>(ICX)</em></p>
                                        <p><span>{numberWithCommas(Number(this.state.Iglobal).toFixed(2))}</span></p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p>Last Block{lastBlockPrepName && <span className='last-block-name-tag'>{lastBlockPrepName}</span>}</p>
                                        <p><span>{numberWithCommas(IconConverter.toNumber(height))}</span></p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>}
                </div>
                <div className="screen2">
                    {loading && <LoadingComponent height='500px' />}
                    {!loading && <div className="wrap-holder">
                        <div className="contents">
                            <div className="search-group">
                                <span>
                                    <input id="cbox-01" className="cbox-type" type="checkbox" name="main" value="main" checked={mainChecked} onChange={this.handleChange} />
                                    <label htmlFor="cbox-01" className="label _img">Main Validators ({allPrep.filter(p => p.grade === 0 || p.grade === '0x0').length})</label>
                                </span>
                                <span>
                                    <input id="cbox-02" className="cbox-type" type="checkbox" name="sub" value='sub' checked={subChecked} onChange={this.handleChange} />
                                    <label htmlFor="cbox-02" className="label _img">Sub Validators ({allPrep.filter(p => p.grade === 1 || p.grade === '0x1').length})</label>
                                </span>
                                <span>
                                    <input id="cbox-03" className="cbox-type" type="checkbox" name="rest" value='rest' checked={restChecked} onChange={this.handleChange} />
                                    <label htmlFor="cbox-03" className="label _img">Candidate ({allPrep.filter(p => p.grade === 2 || p.grade === '0x2').length})</label>
                                </span>
                                <span className="search on"><input type="text" className="txt-type-search modified" placeholder="Validator name / Address" value={search} onChange={this.handleChange} /><i className="img"></i></span>
                            </div>
                            <div className="table-box">
                                <table className="table-typeP">
                                    <colgroup>
                                        <col className="add" />
                                        <col className="rank" />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                        <col />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th className="add">Add</th>
                                            <th className="rank"><span className="sort">Rank ↓</span></th>
                                            <th>Name</th>
                                            <th>CPS Council /<div></div><span>Sponsored<br />Projects</span><i style={{ marginLeft: '5px' }} className="img screamer" onClick={() => {
                                                this.props.setPopup({ type: POPUP_TYPE.SPONSOR })
                                            }}></i></th>
                                            <th>Productivity<br /><em>Produced /<br />(Produced + Missed)</em></th>
                                            {!blackChecked && <th>Bonded /<br />% Bonded</th>}
                                            {!blackChecked && <th>Votes /<br />% Total Votes</th>}
                                            <th>Power</th>
                                            <th style={{ whiteSpace: 'nowrap', padding: '5px' }}>
                                                Monthly
                                                <br /> Rewards
                                                <br />
                                                <em>ICX / USD</em>
                                            </th>
                                            <th style={{ whiteSpace: 'nowrap', padding: '10px' }}>
                                                Commission %<br />
                                                <em>(Max Change / <br />
                                                    Max Rate)
                                                </em>
                                            </th>
                                            <th style={{ minWidth: "100px !important" }}> APR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searched.map((prep, index) => (
                                            <TableRow
                                                governanceStatus={this.getGovernanceStatus(prep.address)}
                                                lastBlockHeight={height}
                                                statusData={this.statusList}
                                                key={index}
                                                index={index}
                                                prep={prep}
                                                totalStaked={totalStaked}
                                                totalVoted={totalVoted}
                                                rrep={rrep}
                                                history={this.props.history}
                                                blackChecked={blackChecked}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className='prep-causion'>
                                This data is periodically synced. Changes can take up to 10 minutes to show up.
                            </p>
                        </div>
                    </div>}
                </div>
            </div>
        )
    }
}

class TableRow extends Component {

    state = {
        logoError: false,
        loaded: false,
        activeStatus: this.statusList,
    }

    loadImage = () => {
        this.setState({ loaded: true })
    }
    getMainBadge = (grade, node_state) => {
        const className = node_state === 'Synced' ? 'prep-tag' : node_state === 'Inactive' ? 'prep-tag off' : 'prep-tag block-synced'
        switch (grade) {
            case 0:
            case '0x0':
                return <span className={className}><i></i>Main Validator</span>
            case 1:
            case '0x1':
                return <span className={className}><i></i>Sub Validator</span>
            case 2:
            case '0x2':
                return <span className={className}><i></i>Candidate</span>
            default:
                return null
        }
    }
    // We only care on the table view if a prep is un-jailing or jailed.
    getJailBadge = (jail_flag) => {
        let badgeText = '';
        let badgeClass = '';
        if (jail_flag === 0 || isNaN(jail_flag)) {
            return false;
        }
        if ([2, 3, 6, 10].includes(jail_flag)) {
            badgeText = 'Unjailing';
            badgeClass = 'unjailing';
        } else {
            badgeText = 'Jail';
            badgeClass = 'jail';
        }
        return <div><span className={`jail-badge ${badgeClass}`}>{badgeText}</span></div>;
    }
    goAddress = address => {
        this.props.history.push('/address/' + address)
    }
    onError = () => {
        this.setState({ logoError: true })
    }

    render() {
        const {
            logoError
        } = this.state
        const {
            totalVoted,
            rrep,
            prep,
            lastBlockHeight,
            blackChecked,
            index,
            governanceStatus,

            statusData,
        } = this.props
        const {
            // rank,
            logo_256,
            logo_svg,
            name,
            address,
            grade,
            total_blocks,
            validated_blocks,
            stake,
            delegated,
            irep,
            irepUpdatedBlockHeight,
            node_state,
            jail_flags,
            logo,
            status,
            commission_rate,
            max_commission_change_rate,
            max_commission_rate,
            reward_monthly, reward_monthly_usd,
            sponsored_cps_grants,
            cps_governance,
            bonded,
            power

            // balance,
            // unstake,
        } = prep
        const sugComRate = ((1 / totalVoted * 100 * 12 * irep / 2) / ((rrep * 3 / 10000) + 1 / totalVoted * 100 * 12 * irep / 2)) * 100;
        const productivity = !total_blocks || Number(total_blocks) === 0 ? 'None' : (Number(validated_blocks) === 0 ? '0.00%' : `${(Number(validated_blocks) / Number(total_blocks) * 100).toFixed(2)}%`)
        const prepVoted = IconConverter.toNumber(delegated || 0)
        const votedRate = !totalVoted ? 0 : prepVoted / totalVoted
        const mainBadge = this.getMainBadge(grade, prep.node_state)

        const jailBadge = this.getJailBadge(parseInt(prep.jail_flags, 16))
        const rank = index + 1
        const bondedRate = !totalVoted ? 0 : prep.bond_percent


        return (
            <tr>
                <td className="rank">
                    <span>{rank || '-'}</span>
                </td>
                <td className={Number(grade) > 2 || grade === '0x3' ? 'black' : 'on'}>
                    <ul className={styles.custom001}>
                        <li>
                            {mainBadge}
                            {jailBadge}
                        </li>
                        <li>
                            {logo_256 ? (
                                <img
                                    src={logo_256 ? logo_256 : logo_svg}
                                    onError={this.onError}
                                    onLoad={this.loadImage}
                                    style={this.state.loaded ? {} : { display: 'none' }}
                                    alt="logo"
                                />
                            ) : (
                                ''
                            )}
                        </li>
                        <li>
                            <span
                                className="ellipsis pointer"
                                onClick={() => {
                                    this.goAddress(address)
                                }}>
                                {name}
                            </span>
                            <em
                                className="ellipsis pointer"
                                onClick={() => {
                                    this.goAddress(address)
                                }}>
                                {address}
                            </em>
                        </li>
                    </ul>
                </td>
                <td>
                    {cps_governance ? (sponsored_cps_grants === 0 || sponsored_cps_grants === null ? '✓' : sponsored_cps_grants) : '-'}
                </td>
                <td>
                    <span>{productivity !== 'None' ? productivity : '0.00%'}</span>
                    <em>
                        {numberWithCommas(Number(validated_blocks))}/ {' '}
                        {numberWithCommas(Number(total_blocks))}
                    </em>
                </td>
                {!blackChecked && (
                    <td className={'bonded'}>
                        <span>{numberWithCommas(Number(bonded / Math.pow(10, 18)).toFixed())}</span>
                        <em>{Number(bondedRate * 100).toFixed(1)}%</em>
                    </td>
                )}
                {!blackChecked && (
                    <td>
                        <span>{numberWithCommas(prepVoted.toFixed(0))}</span>
                        <em>{Number(votedRate * 100).toFixed(1)}%</em>
                    </td>
                )}
                <td>{numberWithCommas(Number(power / Math.pow(10, 18)).toFixed())}</td>
                <td>
                    <span>{numberWithCommas(Number(reward_monthly).toFixed())}</span>
                    <em>{numberWithCommas(Number(reward_monthly_usd).toFixed())}</em>
                </td>
                <td>
                    {isNaN(commission_rate) && isNaN(max_commission_change_rate) && isNaN(max_commission_rate) ? (
                        '-'
                    ) : (
                        <>
                            <em>
                                <span>
                                    {isNaN(commission_rate) ? '-' : numberWithCommas(Number(commission_rate).toFixed())}%
                                </span>
                            </em>
                            <br />
                            <em>
                                {isNaN(max_commission_change_rate) ? '-' : numberWithCommas(Number(max_commission_change_rate).toFixed())}/{' '}
                                {isNaN(max_commission_rate) ? '-' : numberWithCommas(Number(max_commission_rate).toFixed())}
                            </em>
                        </>
                    )}
                </td>
                <td>
                    <em>
                        <span>
                            {prep.apr.toFixed(2)} %

                        </span>
                    </em>
                </td>
            </tr>
        )
    }
}

export default withRouter(GovernancePage);
