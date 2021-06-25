import React from 'react';
import PropTypes from 'prop-types';
import  Plot from 'react-plotly.js';
import { getRunInfo, getExperiments,getRunTags } from '../../experiment-tracking/reducers/Reducers';
import { connect } from 'react-redux';
import console from "react-console";
import { getLatestMetrics } from '../../experiment-tracking/reducers/MetricReducer';
import { Experiment, RunInfo } from '../../experiment-tracking/sdk/MlflowMessages';

export const LIFECYCLE_FILTER = { ACTIVE: 'Active', DELETED: 'Deleted' };
export const BASELINE_SORT = ['Rome', 'CLX8280', 'ICX'];

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
        const {gen_data} = this.props;

        let plots = [];
        var yarray1 = [];
        var yarray2 = [];
        var yarray3 = [];
        var yarray4 = [];
        var yarray5 = [];
        var xarray = [];
        var title = '';
        if(this.props.TagKeyFilterString === "Total"){
          var total_gen_data = new Map();
          var keys = gen_data.keys();
          for (var key of keys) {
             var tmp = key.split("_");
             if(total_gen_data.has(tmp[1]) === false){
              total_gen_data.set(tmp[1], new Map().set(key, gen_data.get(key)));
            }else{
              total_gen_data.get(tmp[1]).set(key, gen_data.get(key));
            }
          }  
        
          var dataMap = new Map();
              const tmpKeys = Array.from(total_gen_data.keys());
              var sortKeys = [];
              BASELINE_SORT.forEach((item) =>{
                  tmpKeys.forEach((item1) =>{
                    if(item === item1){
                      sortKeys.push(item1);
                    }
                  });
              });
              console.log("sortKeys");
              console.log(sortKeys);
              for(let i=0; i< sortKeys.length; i++){
                for(let j=i+1; j< sortKeys.length; j++){
                  const tmpString = sortKeys[i] + "_" + sortKeys[j];
                  console.log("tmpString");
                  console.log(total_gen_data.get(sortKeys[i]));
                  if(dataMap.has(tmpString) === false){
                    const tmpMaps_i = total_gen_data.get(sortKeys[i]);
                    const tmpMaps_j = total_gen_data.get(sortKeys[j]);
                    const tmpMaps = new Map();
                    tmpMaps_i.forEach((value, key ) => tmpMaps.set(key, value));
                    tmpMaps_j.forEach((value, key ) => tmpMaps.set(key, value));
                    dataMap.set(tmpString, tmpMaps);
                  }          
                }
              }
              console.log("dataMap");
              console.log(dataMap);

              dataMap.forEach((value, key) => {
                title = key;
                let i = 0;
                value.forEach((value1, key1) => {
                  xarray[i]=key1;
                  value1.forEach((item) => {
                    if(item.key === "spark initialize"){
                      yarray1[i] = item.value
                    }else if(item.key === "initialize"){
                      yarray2[i] = item.value
                    }else if(item.key === "training"){
                      yarray3[i] = item.value
                    }else if(item.key === "driver training"){
                      yarray4[i] = item.value
                    }else if(item.key === "total"){
                      yarray5[i] = item.value
                    }
                  });
                  i = i + 1 ;
                });

                var trace1 = {
                  x: xarray,
                  y: yarray1,
                  name: 'spark initialize',
                  orientation: 'w',
                  marker: {
                    color: 'rgba(255,0,0,0.3)',
                    width: 1
                  },
                  type: 'bar'
                };
                
                var trace2 = {
                  x: xarray,
                  y: yarray2,
                  name: 'initialize',
                  orientation: 'w',
                  type: 'bar',
                  marker: {
                    color: 'rgba(0,255,0,0.3)',
                    width: 1
                  }
                };
        
                var trace3 = {
                  x: xarray,
                  y: yarray3,
                  name: 'training',
                  orientation: 'w',
                  type: 'bar',
                  marker: {
                    color: 'rgba(0,0,255,0.3)',
                    width: 1
                  }
                };
        
                var trace4 = {
                  x: xarray,
                  y: yarray4,
                  name: 'driver training',
                  orientation: 'w',
                  type: 'bar',
                  marker: {
                    color: 'rgba(255,0,255,0.3)',
                    width: 1
                  }
                };
        
                var tmp = [1];
                var tmpColor = ['rgba(204,204,204,1)'];
                for(let i = 1 ; i < yarray5.length; i++){
                  tmp.push(parseFloat(parseInt(yarray5[i])/parseInt(yarray5[0])).toFixed(3));
                  tmpColor.push(Math.floor(Math.random()*16777215).toString(16));
                }
                var trace5 = {
                  x: xarray,
                  y: tmp,
                  name: 'perfornamce',
                  type: 'bar',
                  text: tmp.map(String),
                  marker: {
                    color: tmpColor
                  }
                };
                
                var dataTrace = [trace1, trace2, trace3, trace4];
                
                var layout ={
                  title: title ,
                  barmode: 'stack',
                };
        
                plots.push(
                  <Plot
                    data = {dataTrace}
                    layout={layout}
                    /> 
                );
        
                plots.push(
                  <Plot
                    data = {[trace5]}
                    layout={layout}
                    /> 
                );   
              });
        }else{
          title = this.props.TagKeyFilterString;
          gen_data.forEach((value,key) =>{
            switch(key){
               case "Vanilla":
                 xarray[0]=key;
                 value.forEach((item) => {
                  if(item.key === "spark initialize"){
                        yarray1[0] = item.value
                      }else if(item.key === "initialize"){
                        yarray2[0] = item.value
                      }else if(item.key === "training"){
                        yarray3[0] = item.value
                      }else if(item.key === "driver training"){
                        yarray4[0] = item.value
                      }else if(item.key === "total"){
                        yarray5[0] = item.value
                      }
                 });
                 break;
               case "MKL":
                  xarray[1]=key;
                  value.forEach((item) => {
                  if(item.key === "spark initialize"){
                        yarray1[1] = item.value
                      }else if(item.key === "initialize"){
                        yarray2[1] = item.value
                      }else if(item.key === "training"){
                        yarray3[1] = item.value
                      }else if(item.key === "driver training"){
                        yarray4[1] = item.value
                      }else if(item.key === "total"){
                        yarray5[1] = item.value
                      }
                  });
                  break;
                case "Openblas":
                  xarray[1]=key;
                  value.forEach((item) => {
                  if(item.key === "spark initialize"){
                        yarray1[1] = item.value
                      }else if(item.key === "initialize"){
                        yarray2[1] = item.value
                      }else if(item.key === "training"){
                        yarray3[1] = item.value
                      }else if(item.key === "driver training"){
                        yarray4[1] = item.value
                      }else if(item.key === "total"){
                        yarray5[1] = item.value
                      }
                  });
                  break;
                case "OAP":
                    xarray[2]=key;
                    value.forEach((item) => {
                    if(item.key === "spark initialize"){
                          yarray1[2] = item.value
                        }else if(item.key === "initialize"){
                          yarray2[2] = item.value
                        }else if(item.key === "training"){
                          yarray3[2] = item.value
                        }else if(item.key === "driver training"){
                          yarray4[2] = item.value
                        }else if(item.key === "total"){
                          yarray5[2] = item.value
                        }
                    });
                  break;
            }
          });
          console.log("yarray");
          console.log(yarray1);
          console.log(yarray2);
          console.log(yarray3);
          console.log(yarray4);
          console.log(yarray5);
          console.log(xarray);


          var trace1 = {
            x: xarray,
            y: yarray1,
            name: 'spark initialize',
            orientation: 'w',
            marker: {
              color: 'rgba(255,0,0,0.3)',
              width: 1
            },
            type: 'bar'
          };
          
          var trace2 = {
            x: xarray,
            y: yarray2,
            name: 'initialize',
            orientation: 'w',
            type: 'bar',
            marker: {
              color: 'rgba(0,255,0,0.3)',
              width: 1
            }
          };
  
          var trace3 = {
            x: xarray,
            y: yarray3,
            name: 'training',
            orientation: 'w',
            type: 'bar',
            marker: {
              color: 'rgba(0,0,255,0.3)',
              width: 1
            }
          };
  
          var trace4 = {
            x: xarray,
            y: yarray4,
            name: 'driver training',
            orientation: 'w',
            type: 'bar',
            marker: {
              color: 'rgba(255,0,255,0.3)',
              width: 1
            }
          };
  
          const tmp = [1, parseFloat(parseInt(yarray5[1])/parseInt(yarray5[0])).toFixed(3), parseFloat(parseInt(yarray5[2])/parseInt(yarray5[0])).toFixed(3)];
          var trace5 = {
            x: xarray,
            y: tmp,
            name: 'perfornamce',
            type: 'bar',
            text: tmp.map(String),
            marker: {
              color: ['rgba(204,204,204,1)', 'rgba(222,45,38,0.8)', 'rgba(255,0,255,0.3)']
            }
          };
          
          var dataTrace = [trace1, trace2, trace3, trace4];
          
          var layout ={
            title: title ,
            barmode: 'stack',
          };
  
          plots.push(
            <Plot
              data = {dataTrace}
              layout={layout}
              /> 
          );
  
          plots.push(
            <Plot
              data = {[trace5]}
              layout={layout}
              /> 
        );   
      }
      return(
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

    console.log("experiment_id");
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
            var tmp = tag.value.split("_");
            if(tmp.length > 1) {
              run_name = tmp[0];
            } else {
              run_name = tag.value;
            }
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

    const latesttagsMap = new Map();
    tagsSet.forEach((string) => {
      console.log(string);
      const tmp = string.split("_");
      var key_name = tmp[2] + '_' + tmp[3] + '_' + tmp[0] 
      if(tmp.length > 4 ){
        key_name = tmp[2] + '_' + tmp[4] + '_' + tmp[0] 
      }
      console.log(tmp);
      if(latesttagsMap.has(key_name) === false){
          console.log(key_name);
          latesttagsMap.set(key_name,string);
      }else{
        const tmpString = latesttagsMap.value.split("_");
        if(parseInt(tmp[1]) > parseInt(tmpString[1])){
          latesttagsMap.set(key_name,string);
        }
      }
    });
    console.log("latesttagsMap");
    console.log(latesttagsMap);


    const tagsMap = new Map();
    const tagsList = latesttagsMap.forEach((value,key) => {
      const tmpvalue = value.split('_');
      const tagsByRunUuid = getRunTags(tmpvalue[0], state);
      const tags = Object.values(tagsByRunUuid || {});
      var isdabosrd="false";
      var checkPlatform = "false";
      tags.forEach((tag) => {
        if(tag.key === "dashboard"){
          if(tag.value === "true"){
            isdabosrd="true";
          }
        }else if(tag.key === "platform"){
          if(tag.value === ownProps.TagKeyFilterString || ownProps.TagKeyFilterString === "Total"){
            checkPlatform = "true";
          }         
        }
        if(isdabosrd === "true"&&checkPlatform === "true"){
          tagsMap.set(tmpvalue[0],tags)
        }
      });
      return tags;
  });

  const metricMap = new Map();
  tagsMap.forEach((item,run_uuid) =>{
      const metricsByRunUuid = getLatestMetrics(run_uuid, state);
      const metrics = Object.values(metricsByRunUuid || {});
      metricMap.set(run_uuid, metrics);        
  });

  console.log("metricMap");
  console.log(metricMap);

  const gen_data = new Map()
  metricMap.forEach((item, run_id) =>{
    var run_name ="";
    var platform = "";
    tagsMap.forEach((it, r_id) =>{
         if(run_id === r_id){
          it.forEach((value) => {
            if(value.key === "mlflow.runName"){
              var tmp = value.value.split("_");
              if(tmp.length > 1) {
                run_name = tmp[0];
              } else {
                run_name = value.value;
              }
            }else if(value.key === "platform"){
              platform = value.value;
            }
          });
         }
    })
    if(ownProps.TagKeyFilterString === "Total"){
      gen_data.set(run_name +'_'+ platform ,item);
    }else {
      gen_data.set(run_name,item);
    }
  })
  console.log("gen_data");
  console.log(gen_data);

  return { gen_data, plot_name};
};

export default connect(mapStateToProps)(ChartPlotView);
