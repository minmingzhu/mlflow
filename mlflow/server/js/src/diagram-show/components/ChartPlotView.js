import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { getRunInfo, getExperiments,getRunTags } from '../../experiment-tracking/reducers/Reducers';
import { connect } from 'react-redux';
import console from "react-console";
import { getLatestMetrics } from '../../experiment-tracking/reducers/MetricReducer';
import { Experiment, RunInfo } from '../../experiment-tracking/sdk/MlflowMessages';
import { ViewType } from '../../experiment-tracking/sdk/MlflowEnums';
import Utils from '../../common/utils/Utils';
import { getUUID } from '../../common/utils/ActionUtils';



export const LIFECYCLE_FILTER = { ACTIVE: 'Active', DELETED: 'Deleted' };

export class ChartPlotView extends React.Component {
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
        var experimentmessage='You selected ' + this.state.runUuids;
        const data = this.props.gen_data;

        const xSet = new Array();
        const ySet = new Array();
        data.forEach((value,key) =>{
          xSet.push(key);
          ySet.push(value);
        });
        console.log(xSet);
        console.log(ySet);

          return(
            
            <div style={{ height: containerHeight }}>
              <Plot
                  data={[
                    {
                      x: xSet,
                      y: ySet,
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: {color: 'red'},
                    },
                    {type: 'bar', x: xSet, y: ySet},
                  ]}
                  layout={{width: 500, height: 500, title: this.props.plot_name}}
                /> 
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

  console.log("experiment_id");
  console.log(experiment_id);

  const runUuids = Object.values(runInfosByUuid)
  .filter((r) => r.experiment_id === ownProps.ExperimentKeyFilterString.toString())
  .map((r) => r.run_uuid);


  const runInfos = runUuids
    .map((run_id) => getRunInfo(run_id, state))



 const alltags = Object.values(state.entities.tagsByRunUuid);

  const tags_value = alltags.filter((tags) => {
    const dashboard = tags.dashboard !== undefined ? tags.dashboard : " ";
    const platform = tags.platform !== undefined ? tags.platform : " ";;
    return dashboard.value === "true" && platform.value === ownProps.TagKeyFilterString;
  })

  const tagsMap = new Map();
  const tagsList = runInfos.map((runInfo) => {
    const tagsByRunUuid = getRunTags(runInfo.getRunUuid(), state);
    const tags = Object.values(tagsByRunUuid || {});
    var isdabosrd="false";
    var checkPlatform = "false";
    tags.forEach((tag) => {
      if(tag.key === "dashboard"){
        if(tag.value === "true"){
          isdabosrd="true";
        }
      }else if(tag.key === "platform"){
        if(tag.value === ownProps.TagKeyFilterString){
          checkPlatform = "true";
        }         
      }
      if(isdabosrd === "true"&&checkPlatform === "true"){
        tagsMap.set(runInfo.getRunUuid(),tags)
      }
    });
    return tags;
  });

  const metricMap = new Map();
  tagsMap.forEach((item,run_uuid) =>{
      const metricsByRunUuid = getLatestMetrics(run_uuid, state);
      const metrics = Object.values(metricsByRunUuid || {});
      metrics.forEach((metric) => {
        if(metric.key === "total"){
          metricMap.set(run_uuid, metric)
        }
      });              
  });

  const gen_data = new Map()
  metricMap.forEach((item, run_id) =>{
    var run_name ="";
    var total ="";
    tagsMap.forEach((it, r_id) =>{
         if(run_id === r_id){
          it.forEach((value) => {
            if(value.key === "mlflow.runName"){
              run_name = value.value;
            }
          });
          if(item.key === "total"){
            total= item.value;
          }
          gen_data.set(run_name,total);
         }
    })
  })

  return { gen_data, plot_name};
};

export default connect(mapStateToProps)(ChartPlotView);
