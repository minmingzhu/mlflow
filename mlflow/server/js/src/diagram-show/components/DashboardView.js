import React from 'react';
import { connect } from 'react-redux';
import '../../../node_modules/react-table-v6/react-table.css'
import console from "react-console";
import {  listExperimentsApi, searchRunsApi, getExperimentApi} from '../../experiment-tracking/actions';
import { getUUID } from '../../common/utils/ActionUtils';
import PropTypes from 'prop-types';
import { ViewType } from '../../experiment-tracking/sdk/MlflowEnums';
import Utils from '../../common/utils/Utils';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import DashboardTableView from '../components/DashboardTableView'


export class DashboardViewImpl extends React.Component {
    constructor(props) {
        console.log("DashboardViewImpl props")
        console.log(props)
        super(props);
        this.state = {
          height:'',
        }
    }
  
    static propTypes = {
      searchRunsApi: PropTypes.func.isRequired,
      getExperimentApi: PropTypes.func.isRequired,
      history: PropTypes.object.isRequired,
      location: PropTypes.object,
    };


    componentDidMount() {
      this.loadData();
    }

    searchRunsRequestId = getUUID();
    getExperimentRequestId = getUUID();

    loadData() {
      const { experiments } = this.props;
      
      this.props.getExperimentApi(this.props.experimentId, this.getExperimentRequestId).catch((e) => {
        console.error(e);
      });
        console.log("dashboard view loadData");
        console.log(this.props)
        this.handleGettingRuns(this.props.searchRunsApi, this.searchRunsRequestId);
    }

    handleGettingRuns = (getRunsAction, requestId) => {
      const { experiments } = this.props;
      console.log("experiments");
      console.log(experiments);
      const experimentIds = experiments.map((r) => r.experiment_id);
      console.log(experimentIds);

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

    render() {
      return (
        <div className='ExperimentPage runs-table-flex-container' style={{ height: '100%' }}>
          <RequestStateWrapper shouldOptimisticallyRender requestIds={this.getRequestIds()}>
           <DashboardTableView/>
          </RequestStateWrapper>
        </div>
      );
    }
  
    getRequestIds() {
      return [this.getExperimentRequestId, this.searchRunsRequestId];
    }
  };
    
  
 const mapDispatchToProps = {
  searchRunsApi,
  getExperimentApi,
};
 
export const DashboardView = connect(undefined, mapDispatchToProps)(DashboardViewImpl)
