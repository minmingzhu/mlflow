import React from 'react';
import { connect } from 'react-redux';
import ReactTable from 'react-table-v6'
import '../../../node_modules/react-table-v6/react-table.css'
import console from "react-console";
import { getRunInfo, getExperiments,getRunTags } from '../../experiment-tracking/reducers/Reducers';
import { getLatestMetrics } from '../../experiment-tracking/reducers/MetricReducer';
import {  listExperimentsApi, searchRunsApi, getExperimentApi} from '../../experiment-tracking/actions';
import { getUUID } from '../../common/utils/ActionUtils';
import PropTypes from 'prop-types';
import { ViewType } from '../../experiment-tracking/sdk/MlflowEnums';
import Utils from '../../common/utils/Utils';
import { Link } from 'react-router-dom';
import Routes from '../../experiment-tracking/routes';


export const COMPARE = {VANILLA_MKL_ICX:"VANILLA_MKL_ICX",
                        VANILLA_OAP_ICX:"VANILLA_OAP_ICX",
                        VANILLA_MKL_CLX:"VANILLA_MKL_CLX",
                        VANILLA_OAP_CLX:"VANILLA_OAP_CLX",
                        VANILLA_Rome_VANILLA_CLX:"VANILLA_Rome_VANILLA_CLX",
                        VANILLA_Rome_OAP_CLX:"VANILLA_Rome_OAP_CLX",
                        VANILLA_Rome_VANILLA_ICX:"VANILLA_Rome_VANILLA_ICX",
                        VANILLA_Rome_OAP_ICX:"VANILLA_Rome_OAP_ICX"};

export class DashboardTableView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          height:'',
        }
    }
  
    static propTypes = {
      searchRunsApi: PropTypes.func.isRequired,
    };

    componentDidMount() {
      this.loadData();
    }

    searchRunsRequestId = getUUID();

    loadData() {
        console.log("dashboard view loadData");
        this.handleGettingRuns(this.props.searchRunsApi, this.searchRunsRequestId);
    }

    handleGettingRuns = (getRunsAction, requestId) => {
      const { experiments } = this.props;
      const experimentIds = experiments.map((r) => r.experiment_id);
      return getRunsAction({
        filter: null,
        runViewType: ViewType.ACTIVE_ONLY,
        experimentIds: experimentIds,
        orderBy: null,
        pageToken: null,
        shouldFetchParents: true,
        id: requestId,
      })
        .catch((e) => {
          Utils.logErrorAndNotifyUser(e);
        });
    };

    updateUrlWithSearchFilter({
      experimentId,
      runUuid,
    }) {
      const state = {};
      if (experimentId) {
        state['experimentid'] = experimentId;
      }
      if (runUuid) {
        state['platform'] = runUuid;
      }
      const newUrl = `/chart/s?${Utils.getSearchUrlFromState(
        state,
      )}`;
      if (newUrl !== this.props.history.location.pathname + this.props.history.location.search) {
        this.props.history.push(newUrl);
      }
    }

  render(){
    const {gendataMap} = this.props;
    const data = []
    console.log(gendataMap);
    var i =0;
    gendataMap.forEach((value,key)=>{
      var datastate = {};
      datastate["workload"]= key
      value.forEach((value,key) => {
        if(key!==undefined){
          datastate[key] = value
        }
      })
      data[i] = datastate;
      i = i + 1;
    });

      const columns = [{
        Header: 'Workload',
        accessor: 'workload',
        width: 300,

      },{
        Header: 'ICX',
        columns: [
          {
            Header: 'Vanilla',
            accessor: 'Vanilla_ICX8360Y',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.Vanilla_ICX8360Y)
                const value = new String(rowInfo.row.Vanilla_ICX8360Y).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.Vanilla_ICX8360Y).split("_")[0] >0 ? 'greenyellow' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'greenyellow' : null}}>
              <Link to = {Routes.getRunPageRoute(value[2], value[1]) }>
              {value[0]}
              </Link>
              </div>
            },
          },{
            Header: 'MKL',
            accessor: 'MKL_ICX8360Y',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.MKL_ICX8360Y)
                const value = new String(rowInfo.row.MKL_ICX8360Y).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.MKL_ICX8360Y).split("_")[0] >0 ? 'greenyellow' : null,
                  },
              };
          },
            Cell: props =>{
              console.log("props")
              console.log(props)
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'greenyellow' : null}}>
                <Link to= {Routes.getRunPageRoute(value[2], value[1])}
              >
              {value[0]}
              </Link>
              </div>
            },
          }, {
            Header: 'OAP',
            accessor: 'OAP_ICX8360Y',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.OAP_ICX8360Y)
                const value = new String(rowInfo.row.OAP_ICX8360Y).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.OAP_ICX8360Y).split("_")[0] >0 ? 'greenyellow' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'greenyellow' : null}}> 
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
            },
          }
        ]
      },{
        Header: 'CLX',
        columns: [
          {
            Header: 'Vanilla',
            accessor: 'Vanilla_CLX8280',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.Vanilla_CLX8280)
                const value = new String(rowInfo.row.Vanilla_CLX8280).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.Vanilla_CLX8280).split("_")[0] >0 ? 'blanchedalmond' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'blanchedalmond' : null}}> 
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
            },
          },{
            Header: 'MKL',
            accessor: 'MKL_CLX8280',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.MKL_CLX8280)
                const value = new String(rowInfo.row.MKL_CLX8280).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.MKL_CLX8280).split("_")[0] >0 ? 'blanchedalmond' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'blanchedalmond' : null}}>  
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
            },
          }, {
            Header: 'OAP',
            accessor: 'OAP_CLX8280',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.OAP_CLX8280)
                const value = new String(rowInfo.row.OAP_CLX8280).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.OAP_CLX8280).split("_")[0] >0 ? 'blanchedalmond' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'blanchedalmond' : null}}>  
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
            },
          }
        ]
      },{
        Header: 'Rome',
        columns: [
          {
            Header: 'Vanilla',
            accessor: 'Vanilla_Rome7402',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.Vanilla_Rome7402)
                const value = new String(rowInfo.row.Vanilla_Rome7402).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.Vanilla_Rome7402).split("_")[0] >0 ? 'orange' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'orange' : null}}>   
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
            },
          }, {
            Header: 'Openblas',
            accessor: 'Openblas_Rome7402',
            getProps: (state, rowInfo, column) => {
              if(rowInfo !== undefined ){
                console.log(rowInfo.row.Openblas_Rome7402)
                const value = new String(rowInfo.row.Openblas_Rome7402).split("_")[0] >0
              }
              return {
                  style: {
                      background: rowInfo && new String(rowInfo.row.Openblas_Rome7402).split("_")[0] >0 ? 'orange' : null,
                  },
              };
          },
            Cell: props =>{
              const value = new String(props.value).split("_")
              return <div style={{ background: value[0] > 0 ? 'orange' : null}}>    
              <Link to= {Routes.getRunPageRoute(value[2], value[1])}>
              {value[0]}
              </Link>
              </div>
          },
    
          }
        ]

      },{
        Header: 'ICX',
        columns: [
          {
            Header: 'VANILLA VS MKL',
            accessor: COMPARE.VANILLA_MKL_ICX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ? rowInfo.row.VANILLA_MKL_ICX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
    
          },{
            Header: 'VANILLA VS OAP',
            accessor:  COMPARE.VANILLA_OAP_ICX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ? rowInfo.row.VANILLA_OAP_ICX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          }
        ]
      },{
        Header: 'CLX',
        columns: [
          {
            Header: 'VANILLA VS MKL',
            accessor:  COMPARE.VANILLA_MKL_CLX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_MKL_CLX >= 1 ? 'lightgreen' : '#ff00007a' : null ,
                  },
              };
          },
          },{
            Header: 'VANILLA VS OAP',
            accessor:  COMPARE.VANILLA_OAP_CLX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_OAP_CLX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          }
        ]
      },{
        Header: 'ICX VS Rome',
        columns: [
          {
            Header: 'VANILLA VS VANILLA',
            accessor:  COMPARE.VANILLA_Rome_VANILLA_ICX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_Rome_VANILLA_ICX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          },{
            Header: 'OAP VS VANILLA',
            accessor:  COMPARE.VANILLA_Rome_OAP_ICX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_Rome_OAP_ICX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          },    
        ]
      },{
        Header: 'CLX VS Rome',
        columns: [
          {
            Header: 'VANILLA VS VANILLA',
            accessor:  COMPARE.VANILLA_Rome_VANILLA_CLX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_Rome_VANILLA_CLX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          },{
            Header: 'OAP VS VANILLA',
            accessor:  COMPARE.VANILLA_Rome_OAP_CLX,
            width: 150,
            getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: rowInfo ?  rowInfo.row.VANILLA_Rome_OAP_CLX >= 1 ? 'lightgreen' : '#ff00007a' : null,
                  },
              };
          },
          }
        ]
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
    console.log(ownProps)
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
          runnuuid_workflownameSet.add(tmp[0] +'@'+e.name +'@'+ e.experiment_id);
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
              const temp = runuuidMap.get(tmp[0]).split("_");
              tmpMap.set(temp[0] + '_'+ temp[1],totalvalue + "_" + tmp[0] + "_" + tmp[2]);
              gendataMap.set(tmp[1],tmpMap);
            }else{
              const temp = runuuidMap.get(tmp[0]).split("_");
              gendataMap.get(tmp[1]).set(temp[0] + '_'+ temp[1], totalvalue + "_" + tmp[0] + "_" + tmp[2]);
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
          if(tmp[1] === "ICX8360Y"){
            ICXmap.set(tmp[0],value);
          }else if(tmp[1] === "CLX8280"){
            CLXmap.set(tmp[0],value);
          }else if(tmp[1] === "Rome7402"){
            Romemap.set(tmp[0],value);
          }
      }
    });
    if(ICXmap.get("Vanilla") !== null  || ICXmap.get("Vanilla") !==undefined  || ICXmap.get("Vanilla") !==" "  
       && ICXmap.get("MKL")!==null ||ICXmap.get("MKL")!==undefined ||ICXmap.get("MKL")!==" "){
      item.set(COMPARE.VANILLA_MKL_ICX,   parseFloat(parseInt(ICXmap.get("Vanilla"))/parseInt(ICXmap.get("MKL"))).toFixed(3));
    }
    if(ICXmap.get("Vanilla") !== null  || ICXmap.get("Vanilla") !==undefined  || ICXmap.get("Vanilla") !==" "  
       && ICXmap.get("OAP")!==null ||ICXmap.get("OAP")!==undefined ||ICXmap.get("OAP")!==" "){
        item.set(COMPARE.VANILLA_OAP_ICX,   parseFloat(parseInt(ICXmap.get("Vanilla"))/parseInt(ICXmap.get("OAP"))).toFixed(3));
      }
    if(CLXmap.get("Vanilla") !== null  || CLXmap.get("Vanilla") !==undefined  || CLXmap.get("Vanilla") !==" "  
       && CLXmap.get("MKL")!==null ||CLXmap.get("MKL")!==undefined ||CLXmap.get("MKL")!==" "){
        item.set(COMPARE.VANILLA_MKL_CLX,   parseFloat(parseInt(CLXmap.get("Vanilla"))/parseInt(CLXmap.get("MKL"))).toFixed(3));
      }
    if(CLXmap.get("Vanilla") !== null  || CLXmap.get("Vanilla") !==undefined  || CLXmap.get("Vanilla") !==" "  
    && CLXmap.get("OAP")!==null ||CLXmap.get("OAP")!==undefined ||CLXmap.get("OAP")!==" "){
      item.set(COMPARE.VANILLA_OAP_CLX,   parseFloat(parseInt(CLXmap.get("Vanilla"))/parseInt(CLXmap.get("OAP"))).toFixed(3));
    }
    if(ICXmap.get("Vanilla") !== null  || ICXmap.get("Vanilla") !==undefined  || ICXmap.get("Vanilla") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.VANILLA_Rome_VANILLA_ICX,  parseFloat(parseInt(Romemap.get("Vanilla"))/parseInt(ICXmap.get("Vanilla"))).toFixed(3));
    }   
    if(ICXmap.get("OAP") !== null  || ICXmap.get("OAP") !==undefined  || ICXmap.get("OAP") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.VANILLA_Rome_OAP_ICX,  parseFloat(parseInt(Romemap.get("Vanilla"))/parseInt(ICXmap.get("OAP"))).toFixed(3));
    }
    if(CLXmap.get("Vanilla") !== null  || CLXmap.get("Vanilla") !==undefined  || CLXmap.get("Vanilla") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.VANILLA_Rome_VANILLA_CLX,  parseFloat(parseInt(Romemap.get("Vanilla"))/parseInt(CLXmap.get("Vanilla"))).toFixed(3));
    }
    if(CLXmap.get("OAP") !== null  || CLXmap.get("OAP") !==undefined  || CLXmap.get("OAP") !==" "  
    && Romemap.get("Vanilla")!==null ||Romemap.get("Vanilla")!==undefined ||Romemap.get("Vanilla")!==" "){
      item.set(COMPARE.VANILLA_Rome_OAP_CLX,  parseFloat(parseInt(Romemap.get("Vanilla"))/parseInt(CLXmap.get("OAP"))).toFixed(3));
    }
  });
  console.log(gendataMap);

  return {experiments,metricMap,latesttagsMap,gendataMap};
 
 };
  
 const mapDispatchToProps = {
  searchRunsApi,
  getExperimentApi,
};
 
export default connect(mapStateToProps,mapDispatchToProps)(DashboardTableView);
