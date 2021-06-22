import React from 'react';
import PropTypes from 'prop-types';
import { getRunInfo, getExperiments,getRunTags } from '../../experiment-tracking/reducers/Reducers';
import { connect } from 'react-redux';
import console from "react-console";
import { getLatestMetrics } from '../../experiment-tracking/reducers/MetricReducer';
import { Experiment, RunInfo } from '../../experiment-tracking/sdk/MlflowMessages';
import Plot from 'react-plotly.js';
import moment from 'moment';


export const LIFECYCLE_FILTER = { ACTIVE: 'Active', DELETED: 'Deleted' };

export class MilestonesPlotView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Lifecycle filter of runs to display
      lifecycleFilter: LIFECYCLE_FILTER.ACTIVE,
      experiment:'',
      ExperimentKeyFilterString: '' ,
      };
    }
  
    static propTypes = {
        ExperimentKeyFilterString: PropTypes.string,
        TagKeyFilterString: PropTypes.string,
        lifecycleFilter: PropTypes.string.isRequired,
        experiment: PropTypes.instanceOf(Experiment).isRequired,
        runInfos: PropTypes.arrayOf(PropTypes.instanceOf(RunInfo)).isRequired,
        isdabosrd: PropTypes.bool,
        checkPlatform: PropTypes.bool,
      };

  render(){
        const height = this.state.height || window.innerHeight;
        const headerHeight = process.env.HIDE_HEADER === 'true' ? 0 : 60;
        const containerHeight = 'calc(100% - ' + headerHeight + 'px)';
        // 60 pixels for the height of the top bar.
        // 100 for the experiments header and some for bottom padding.
        const experimentListHeight = height - 50 - 100;
        var experimentmessage='You selected ' + this.props.plot_name;
        console.log(this.props.gen_data);
        var xarry = '';
        var yarry = '';
        let plots = [];
        this.props.gen_data.forEach((value , key ) => {
                xarry = new Array();
                yarry = new Array();
                value.forEach((item) => {
                  const itemTmp = item.split("_");
                  yarry.push(itemTmp[2]);
                  xarry.push(moment(parseInt(itemTmp[1])).format("YYYY-MM-DD HH:mm:ss"));
                  console.log(xarry);
                  console.log(yarry);
                  plots.push(
                        <Plot
                            data={[
                              {
                                x: xarry,
                                y: yarry,
                                type: 'scatter',
                                mode: 'lines+markers',
                                marker: {color: 'red'},
                              },
                              {type: 'line'},
                            ]}
                            layout={{width: 320, height: 240, title: key}}
                          />
                  );
                });
            });
        return (
          <div style={{ height: containerHeight }}>
            {plots}
          </div>
        );
  }
}

export const mapStateToProps = (state, ownProps) => {
    const { runInfosByUuid } = state.entities;
    const experiments = getExperiments(state)
    const experiment = experiments.filter((e) => e.experiment_id === ownProps.ExperimentKeyFilterString.toString()).map((e) => e.name)
    const plot_name = experiment[0]

    const experiment_id = experiments.filter((e) => e.experiment_id === ownProps.ExperimentKeyFilterString.toString()).map((e) => e.experiment_id)

    console.log("Milestones experiment_id");
    console.log(experiment_id);

    const runUuids = Object.values(runInfosByUuid)
    .filter((r) => r.experiment_id === ownProps.ExperimentKeyFilterString.toString())
    .map((r) => r.run_uuid);


    const runInfos = runUuids
        .map((run_id) => getRunInfo(run_id, state))

  
    const tagsSet = new Set();
    runInfos.map((runInfo) => {
      const tagsByRunUuid = getRunTags(runInfo.getRunUuid(), state);
      const {start_time: startTime } = runInfo;
      const tags = Object.values(tagsByRunUuid || {});
      var run_name ="";
      var platform ="";
      var isdabosrd="";
      tags.forEach((tag) => {

        if(tag.key === "mlflow.runName"){
          run_name = tag.value;
        }else if(tag.key === "platform") {
          platform = tag.value;
        }
        if(tag.key === "dashboard"){
          isdabosrd = tag.value;
        }
      });
      if(isdabosrd === "true"){
        const newString = runInfo.getRunUuid() + '_' + startTime + '_' + run_name + '_' + platform ;
        tagsSet.add(newString);
      }
   });
  console.log("tagsSet");
  console.log(tagsSet);

  const metricMap = new Map();
  tagsSet.forEach((item) =>{
      const tmp = item.split("_");
      const metricsByRunUuid = getLatestMetrics(tmp[0], state);
      const metrics = Object.values(metricsByRunUuid || {});
      metrics.forEach((metric) => {
        if(metric.key === "total"){
          metricMap.set(item, metric.value)
        }
      });              
  });

  const gen_data = new Map()
  metricMap.forEach((value, key) =>{
    const tmp = key.split("_");
    const arrays =new Array();
    if(gen_data.has(tmp[2] +'_'+ tmp[3]) === false ){
        arrays.push(tmp[0] + '_' + tmp[1] + '_' + value);
        gen_data.set(tmp[2] +'_'+ tmp[3], arrays);
    } else {
        gen_data.get(tmp[2] +'_'+ tmp[3]).push(tmp[0] + '_' + tmp[1] + '_' + value);
    } 
  })
  console.log("gen_data");
  console.log(gen_data);

  gen_data.forEach((value, key) => {
      value.sort(function(x, y){
        const xtmp = x.split("_");
        const ytmp = x.split("_");
        if (parseInt(xtmp[1]) < parseInt(ytmp[1])) {
            return 1;
        }
        if (parseInt(xtmp[1]) > parseInt(ytmp[1])) {
            return -1;
        }
        return 0;
      });
  });

  console.log(gen_data);
  return { gen_data, plot_name};
};

export default connect(mapStateToProps)(MilestonesPlotView);