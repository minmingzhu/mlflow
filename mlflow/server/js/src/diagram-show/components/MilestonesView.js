import React from 'react';
import { connect } from 'react-redux';
import Utils from '../../common/utils/Utils';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { Experiment } from '../../experiment-tracking/sdk/MlflowMessages';
import { getExperiments } from '../../experiment-tracking/reducers/Reducers';
import console from "react-console";
import MilestonesPlotView from './MilestonesPlotView';

export const getFirstActiveExperiment = (experiments) => {
  const sorted = experiments.concat().sort(Utils.compareExperiments);
  return sorted.find((e) => e.lifecycle_stage === 'active');
};

export class MilestonesView extends React.Component {
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
  };

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
          <div className='milestones-list-container' style={{ height: experimentListHeight }}>
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
                    Platform:
                    <select defaultValue={this.props.TagKeyFilterString} name="TagKeyFilterString" class="ui dropdown" value={this.state.TagKeyFilterString} onChange={this.handleChange}>
                      <option value="ICX8360Y" >ICX8360Y</option>
                      <option value="Rome7402">Rome7402</option>
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
           <div className='milestones-view-container' style={{ height: experimentListHeight }}>
                  <MilestonesPlotView 
                  ExperimentKeyFilterString={this.props.ExperimentKeyFilterString}
                  TagKeyFilterString={this.props.TagKeyFilterString}
                  />                     
           </div>
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
      console.log(this.props.ExperimentKeyFilterString)
      console.log(this.props.TagKeyFilterString)
      const myExperimentKeyFilterString =
      ExperimentKeyFilterString !== undefined ? ExperimentKeyFilterString : this.props.ExperimentKeyFilterString;
      const myTagKeyFilterString =
      TagKeyFilterString !== undefined ? TagKeyFilterString : this.props.TagKeyFilterString;
      this.props.onSearch(
        myExperimentKeyFilterString,
        myTagKeyFilterString,
      );
    }
  }
  
  
  
  const mapStateToProps = (state, ownProps) => {
    const experiments = getExperiments(state);
    console.log(state);
    console.log("milestones view");
    console.log(ownProps)
    const { runInfosByUuid } = state.entities;
    const runUuids = Object.values(runInfosByUuid)
    .filter((r) => r.experiment_id)
    .map((r) => r.run_uuid);

    experiments.sort(Utils.compareExperiments);
    console.log("Milestones Bashboard view");
    console.log({experiments})
    console.log({runInfosByUuid})
    console.log({runUuids})

    if (ownProps.ExperimentKeyFilterString === undefined || ownProps.ExperimentKeyFilterString === "") {
      const firstExp = getFirstActiveExperiment(getExperiments(state));
      if (firstExp) {
        return {experiments,ExperimentKeyFilterString: firstExp.experiment_id, TagKeyFilterString: "Total"};
      };
    }

    return {experiments, runUuids};
  };
  
  export default connect(mapStateToProps)(MilestonesView);