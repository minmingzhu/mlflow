import React from 'react';
import { connect } from 'react-redux';
import Utils from '../../common/utils/Utils';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { Experiment } from '../../experiment-tracking/sdk/MlflowMessages';
import { getExperiments } from '../../experiment-tracking/reducers/Reducers';
import { getExperimentApi, getRunApi, searchRunsApi } from '../../experiment-tracking/actions';
import console from "react-console";
import ChartPlotView from './ChartPlotView';
import { getUUID } from '../../common/utils/ActionUtils';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { ViewType } from '../../experiment-tracking/sdk/MlflowEnums';


export class ChartView extends React.Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.state = {
      height:'',
    }
  }

  static propTypes = {
    runUuid: PropTypes.string.isRequired,
    run: PropTypes.object.isRequired,
    experiment: PropTypes.instanceOf(Experiment).isRequired,
    experimentId: PropTypes.string.isRequired,
    latestMetrics: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
    ExperimentKeyFilterString: PropTypes.string.isRequired,
    TagKeyFilterString: PropTypes.string.isRequired,
    getExperimentApi: PropTypes.func.isRequired,
    searchRunsApi: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    this.props.getExperimentApi(this.props.experimentId, this.getExperimentRequestId).catch((e) => {
      console.error(e);
    });

  }

  getExperimentRequestId = getUUID();
  searchRunsRequestId = getUUID();


   handleGettingRuns = (getRunsAction, requestId, state) => {
     return getRunsAction({
       filter: null,
       runViewType: ViewType.ACTIVE_ONLY,
       experimentIds:  [this.state.ExperimentKeyFilterString],
       orderBy: null,
       pageToken: null,
       shouldFetchParents: true,
       id: requestId,
     })
       .catch((e) => {
         Utils.logErrorAndNotifyUser(e);
       });
   };

  getRequestIds() {
    return [this.getExperimentRequestId, this.searchRunsRequestId];
  }
  
    render() {
      console.log("props view");
      console.log(this.props)
      const height = this.state.height || window.innerHeight;
      const headerHeight = process.env.HIDE_HEADER === 'true' ? 0 : 60;
      const containerHeight = 'calc(100% - ' + headerHeight + 'px)';
      // 60 pixels for the height of the top bar.
      // 100 for the experiments header and some for bottom padding.
      const experimentListHeight = height - 50 - 100;
      const { searchInput } = this.state;
      return (
        <div className='outer-container' style={{ height: containerHeight }}>
          <RequestStateWrapper shouldOptimisticallyRender requestIds={this.getRequestIds()}>
          <div className='chart-list-container' style={{ height: experimentListHeight }}>
            <div>
              <label>
                  Experiment_id:
                    <select defaultValue={this.props.ExperimentKeyFilterString} name="ExperimentKeyFilterString" class="ui dropdown"  value={this.state.ExperimentKeyFilterString} onChange={this.handleChange}>
                        {this.props.experiments
                          // filter experiments based on searchInput
                          .filter((exp) =>
                            exp
                              .getName(),
                          )
                          .map((exp) => {
                            const { name, experiment_id } = exp;
                            return (
                                <option  key={experiment_id} value = {experiment_id} > {name} </option>
                            );
                          })}
                    </select>
                </label>
              </div>
              <div>
                <label>
                    Platfrom:
                    <select defaultValue={this.props.TagKeyFilterString} name="TagKeyFilterString" class="ui dropdown" value={this.state.TagKeyFilterString} onChange={this.handleChange}>
                      <option value="Default">Default</option>
                      <option value="ICX">ICX</option>
                      <option value="Rome">Rome</option>
                      <option value="CLX8280">CLX8280</option>
                      <option value="Total">Total</option>
                    </select>
                  </label>
                </div>
                <div className='search-control-btns'>
                    <Button type='primary' className='search-button' onClick={this.onSearch}>
                        Search
                    </Button>
                </div>
           </div>
           <div className='chart-view-container' style={{ height: experimentListHeight }}>
                     <ChartPlotView 
                     ExperimentKeyFilterString={this.props.ExperimentKeyFilterString}
                     TagKeyFilterString={this.props.TagKeyFilterString}
                     experiments={this.props.experiments}
                     runUuids={this.props.runUuids}
                    />
           </div>
        </RequestStateWrapper>
       </div>
        );
    }

    handleChange = (e) => {
      this.setState({[e.target.name]: e.target.value});
    }
  
    onSearch = (e) => {
      if (e !== undefined) {
        e.preventDefault();
      }
      const {
        ExperimentKeyFilterString,
        TagKeyFilterString,
      } = this.state;
      console.log("onSearch")
      console.log(this.props) 
      console.log(this.state.ExperimentKeyFilterString)
      console.log(this.state.TagKeyFilterString)
      const myExperimentKeyFilterString =
      ExperimentKeyFilterString !== undefined ? ExperimentKeyFilterString : this.state.ExperimentKeyFilterString;
      const myTagKeyFilterString =
      TagKeyFilterString !== undefined ? TagKeyFilterString : this.state.TagKeyFilterString;
      this.handleGettingRuns(this.props.searchRunsApi, this.searchRunsRequestId, this.state);
      this.props.onSearch(
        myExperimentKeyFilterString,
        myTagKeyFilterString,
      );
    }
  }
  
  const mapDispatchToProps = {
    getRunApi,
    getExperimentApi,
    searchRunsApi,
  };
  
  
  const mapStateToProps = (state, ownProps) => {
    const experiments = getExperiments(state);
    console.log(state);
    console.log("ownProps view");
    console.log(ownProps)
    const { runInfosByUuid } = state.entities;
    const runUuids = Object.values(runInfosByUuid)
    .filter((r) => r.experiment_id)
    .map((r) => r.run_uuid);

    experiments.sort(Utils.compareExperiments);
    console.log("Bashboard view");
    console.log({experiments})
    console.log({runInfosByUuid})
    console.log({runUuids})

    return {experiments, runUuids};
  };
  
  export default connect(mapStateToProps,mapDispatchToProps)(ChartView);