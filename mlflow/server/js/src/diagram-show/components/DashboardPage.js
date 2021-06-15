import React from 'react';
import { connect } from 'react-redux';
import ReactTable from 'react-table-v6'
import '../../../node_modules/react-table-v6/react-table.css'
import console from "react-console";
import { getRunInfo, getExperiments,getRunTags } from '../../experiment-tracking/reducers/Reducers';
import { getLatestMetrics } from '../../experiment-tracking/reducers/MetricReducer';


export const COMPARE = {VANILLA_MKL_ICX:"Vanilla ICX V.S MKL ICX",
                        VANILLA_OAP_ICX:"Vanilla ICX V.S OAP ICX",
                        VANILLA_MKL_CLX:"Vanilla CLX V.S MKL CLX",
                        VANILLA_OAP_CLX:"Vanilla CLX V.S OAP CLX",
                        VANILLA_Rome_OAP_CLX:"Vanilla Rome V.S OAP ICX",
                        VANILLA_Rome_OAP_ICX:"Vanilla Rome V.S OAP CLX"};

export class DashboardPageImpl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          height:'',
        }
    }
  

  render(){
    const {gendataMap} = this.props;
    const data = []
    gendataMap.forEach((value,key)=>{
      var i =0;
      const datastate = {};
      datastate["workload"]= key
      value.forEach((value,key) => {
        datastate[key] = value
      })
      data[i] = datastate;
      i = i + 1;
    });
    
      const columns = [{
        Header: 'Workload',
        accessor: 'workload'
      }, {
        Header: 'ICX Vanilla',
        accessor: 'Vanilla_ICX',
      },{
        Header: 'ICX MKL',
        accessor: 'MKL_ICX',
      }, {
        Header: 'ICX OAP',
        accessor: 'OAP_ICX',

      },  {
        Header: 'CLX Vanilla',
        accessor: 'Vanilla_CLX',
      },{
        Header: 'CLX MKL',
        accessor: 'MKL_CLX',
      }, {
        Header: 'CLX OAP',
        accessor: 'OAP_CLX',

      },{
        Header: 'Rome Vanilla',
        accessor: 'Vanilla_Rome',
      }, {
        Header: 'Rome Openblas',
        accessor: 'Openblas_Rome',

      },{
        Header: 'VANILLA_MKL_ICX',
        accessor: COMPARE.VANILLA_MKL_ICX,

      },{
        Header: 'VANILLA_OAP_ICX',
        accessor:  COMPARE.VANILLA_OAP_ICX,

      },{
        Header: 'VANILLA_MKL_CLX',
        accessor:  COMPARE.VANILLA_MKL_CLX,

      },{
        Header: 'VANILLA_MKL_CLX',
        accessor:  COMPARE.VANILLA_OAP_ICX,

      },{
        Header: 'VANILLA_Rome_OAP_CLX',
        accessor:  COMPARE.VANILLA_Rome_OAP_CLX,

      },{
        Header: 'VANILLA_Rome_OAP_ICX',
        accessor:  COMPARE.VANILLA_Rome_OAP_ICX,

      }
    ]
    
      return <ReactTable
        data={data}
        columns={columns}
      />
    }
  };
    
  export const mapStateToProps = (state, ownProps) => {
    console.log(state)
    const { runInfosByUuid } = state.entities;
    const experiments = getExperiments(state)

    const runUuids = Object.values(runInfosByUuid)
    .filter((r) => r.experiment_id)
    .map((r) => r.run_uuid);
    console.log("runUuids");
    console.log(runUuids);
  
    const runInfos = runUuids
      .map((run_id) => getRunInfo(run_id, state))
    console.log("runInfos");
    console.log(runInfos);
  
    const tagsSet = new Set();
    const tagsList = runInfos.map((runInfo) => {
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

    return tags;
  });
  console.log("tagsSet");
  console.log(tagsSet);

  const latesttagsMap = new Map();
  tagsSet.forEach((string) => {
    console.log(string);
    const tmp = string.split("_");
    var key_name = tmp[2] + '_' + tmp[3]
    if(tmp.length > 4 ){
      key_name = tmp[2] + '_' + tmp[4]
    }
    console.log(tmp);
    if(latesttagsMap.has(key_name) === false){
        console.log(key_name);
        latesttagsMap.set(key_name,string);
    }else{
      console.log(latesttagsMap.value);
      const tmpString = latesttagsMap.value.split("_");
      if(parseInt(tmp[1]) > parseInt(tmpString[1])){
        latesttagsMap.set(key_name,string);
      }
    }
  });
  console.log("latesttagsMap");
  console.log(latesttagsMap);

  const runuuidMap = new Map();
  latesttagsMap.forEach((value,key) => {
    const tmpvalue = value.split('_');
    runuuidMap.set(tmpvalue[0],key );
  });
  console.log("runuuidMap");
  console.log(runuuidMap);

  const metricMap = new Map();
  tagsSet.forEach((string) =>{
      const tmp = string.split("_");
      const metricsByRunUuid = getLatestMetrics(tmp[0], state);
      const metrics = Object.values(metricsByRunUuid || {});
      metrics.forEach((metric) => {
        if(metric.key === "total"){
          metricMap.set(tmp[0], metric)
        }
      });              
  });
  console.log("metricMap");
  console.log(metricMap);

  const experiment_runuuidSet =new Set();
  runInfos.filter((r) =>{ 
    metricMap.forEach((value, key) => {
      if(key === r.run_uuid){
        console.log("true");
        return;
      }
    });
    return r;
  }).forEach((item) => {
      experiment_runuuidSet.add(item.run_uuid +'_'+item.experiment_id);
  });

  console.log("experiment_runuuidSet");
  console.log(experiment_runuuidSet);

  const runnuuid_workflownameSet = new Set();
  experiments.filter((e) =>{
    experiment_runuuidSet.forEach((item) => {
         const tmp = item.split("_");
         if(tmp[1] === e.experiment_id){
          runnuuid_workflownameSet.add(tmp[0] +'@'+e.name);
         }
    });
  });

  console.log("runnuuid_workflownameSet");
  console.log(runnuuid_workflownameSet);


  const gendataMap =new Map();
  runnuuid_workflownameSet.forEach((item) =>{
      const tmpMap =new Map();
      const tmp = item.split('@');
      var totalvalue  ='';
      metricMap.forEach((item, run_id) =>{
        if(run_id === tmp[0]){
          item.forEach((value, key)=> {
              if(key === "value"){
                totalvalue=value;
              }
          })
          if(tmp[1]!==undefined || tmp[1]!==" " || tmp[1]!== null ){
            if(gendataMap.has(tmp[1]) === false){
              tmpMap.set(runuuidMap.get(tmp[0]),totalvalue);
                gendataMap.set(tmp[1],tmpMap);
            }else{
                gendataMap.get(tmp[1]).set(runuuidMap.get(tmp[0]), totalvalue);
            }
          }
        }
      });
  });
  console.log("gendataMap");
  console.log(gendataMap);
  gendataMap.forEach((item,name) => {
    const ICXmap =new Map();
    const CLXmap =new Map();
    const Romemap =new Map();
    item.forEach((value, key) => {
      if(key!==undefined || key!==" " || key!== null ){
          const tmp = key.split("_");
          if(tmp[1] === "ICX"){
            ICXmap.set(tmp[0],value);
          }else if(tmp[1] === "CLX"){
            CLXmap.set(tmp[0],value);
          }else if(tmp[1] === "Rome"){
            Romemap.set(tmp[0],value);
          }
      }
    });
    if(ICXmap.get("Vanilla") !== null  || ICXmap.get("Vanilla") !==undefined  || ICXmap.get("Vanilla") !==" "  
       && ICXmap.get("MKL")!==null ||ICXmap.get("MKL")!==undefined ||ICXmap.get("MKL")!==" "){
      item.set(COMPARE.BASELINE_MKL_ICX,  parseInt(ICXmap.get("Vanilla"))/ICXmap.get("MKL"));
    }
    if(ICXmap.get("Vanilla") !== null  || ICXmap.get("Vanilla") !==undefined  || ICXmap.get("Vanilla") !==" "  
       && ICXmap.get("OAP")!==null ||ICXmap.get("OAP")!==undefined ||ICXmap.get("OAP")!==" "){
        item.set(COMPARE.BASELINE_OAP_ICX,  parseInt(ICXmap.get("Vanilla"))/ICXmap.get("OAP"));
      }
    if(CLXmap.get("Vanilla") !== null  || CLXmap.get("Vanilla") !==undefined  || CLXmap.get("Vanilla") !==" "  
       && CLXmap.get("MKL")!==null ||CLXmap.get("MKL")!==undefined ||CLXmap.get("MKL")!==" "){
        item.set(COMPARE.BASELINE_MKL_CLX,  parseInt(CLXmap.get("Vanilla"))/CLXmap.get("MKL"));
      }
    if(CLXmap.get("Vanilla") !== null  || CLXmap.get("Vanilla") !==undefined  || CLXmap.get("Vanilla") !==" "  
    && CLXmap.get("OAP")!==null ||CLXmap.get("OAP")!==undefined ||CLXmap.get("OAP")!==" "){
      item.set(COMPARE.BASELINE_OAP_CLX,  parseInt(CLXmap.get("Vanilla"))/CLXmap.get("OAP"));
    }   
    if(ICXmap.get("OAP") !== null  || ICXmap.get("OAP") !==undefined  || ICXmap.get("OAP") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.BASELINE_Rome_OAP_ICX,  parseInt(ICXmap.get("OAP"))/Romemap.get("Vanilla"));
    }
    if(CLXmap.get("OAP") !== null  || CLXmap.get("OAP") !==undefined  || CLXmap.get("OAP") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.BASELINE_Rome_OAP_CLX,  parseInt(CLXmap.get("OAP"))/Romemap.get("Vanilla"));
    }
  });


  return {metricMap,latesttagsMap,gendataMap};
 
 };
  
  export const DashboardPage = connect(mapStateToProps)(DashboardPageImpl);{}