import React from 'react';
import { connect } from 'react-redux';
import '../../../node_modules/react-table-v6/react-table.css'
import console from "react-console";
import {  listExperimentsApi, searchRunsApi, getExperimentApi} from '../../experiment-tracking/actions';
import { getUUID } from '../../common/utils/ActionUtils';
import PropTypes from 'prop-types';
import { Experiment } from '../../experiment-tracking/sdk/MlflowMessages';
import { DashboardView } from "../../diagram-show/components/DashboardView"
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { getExperiments } from '../../experiment-tracking/reducers/Reducers';


export class DashboardPageImpl extends React.Component {
  constructor(props) {
    console.log("DashboardPageImpl props")
    console.log(props)
    super(props);
  }

  static propTypes = {
    dispatchListExperimentsApi: PropTypes.func.isRequired,
    experiments: PropTypes.arrayOf(Experiment).isRequired,
  };

  state = {
    listExperimentsRequestId: getUUID(),
  };

  componentWillMount() {
      this.props.dispatchListExperimentsApi(this.state.listExperimentsRequestId);
  }

  render(){
    return(
        <RequestStateWrapper requestIds={[this.state.listExperimentsRequestId]}>
          <DashboardView experiments = {this.props.experiments}/>
        </RequestStateWrapper>
      )
    } 
  };
    
  export const mapStateToProps = (state, ownProps) => {
    const { match } = ownProps;
    if (match.url === '/') {
      console.log("dashbord page")
      console.log(state)
      const experiments = getExperiments(state);
      console.log("experiments")
      console.log(experiments)
      return { experiments };
    }
  };
  
 const mapDispatchToProps = (dispatch) => {
  console.log("dashbord page mapDispatchToProps")
  return {
    dispatchListExperimentsApi: (requestId) => {
      console.log(requestId)
      const tmp = dispatch(listExperimentsApi(requestId))
      console.log(tmp);
      return tmp;
    },
  };
};
 
  export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(DashboardPageImpl);