import React from 'react';
import { connect } from 'react-redux';
import MilestonesView from './MilestonesView';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import PropTypes from 'prop-types';
import { getUUID } from '../../common/utils/ActionUtils';
import { listExperimentsApi, searchRunsApi,
} from '../../experiment-tracking/actions';
import Utils from '../../common/utils/Utils';
import console from "react-console";


export class MilestonesPageImpl extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        ExperimentKeyFilterString: '' ,
        TagKeyFilterString: '' ,
        listExperimentsRequestId: getUUID(),
    };
  }

  static propTypes = {
    // getRunApi: PropTypes.func.isRequired,
    // getExperimentApi: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    ExperimentKeyFilterString: PropTypes.string.isRequired,
    TagKeyFilterString: PropTypes.string.isRequired,
    dispatchListExperimentsApi: PropTypes.func.isRequired,
  };

  componentWillMount() {
      this.props.dispatchListExperimentsApi(this.state.listExperimentsRequestId);
  }

  render() {
    const requestIds = [this.getRunRequestId, this.getExperimentRequestId];
    const {
      ExperimentKeyFilterString,
      TagKeyFilterString,
    } = this.props;
    return (
      <RequestStateWrapper requestIds={[this.state.listExperimentsRequestId]}>
        <div className='App-content'>
          <MilestonesView
           onSearch={this.onSearch}
           ExperimentKeyFilterString={ExperimentKeyFilterString}
           TagKeyFilterString={TagKeyFilterString}
          />
      </div>
      </RequestStateWrapper>
    );
  }

  onSearch = (
    ExperimentKeyFilterString,
    TagKeyFilterString,
  ) => {
    this.updateUrlWithSearchFilter({
      ExperimentKeyFilterString,
      TagKeyFilterString,
    });
  }

  updateUrlWithSearchFilter({
    ExperimentKeyFilterString,
    TagKeyFilterString,
  }) {
    const state = {};
    if (ExperimentKeyFilterString) {
      state['experimentid'] = ExperimentKeyFilterString;
    }
    if (TagKeyFilterString) {
      state['platform'] = TagKeyFilterString;
    }
    const newUrl = `/milestones/s?${Utils.getSearchUrlFromState(
      state,
    )}`;
    if (newUrl !== this.props.history.location.pathname + this.props.history.location.search) {
      this.props.history.push(newUrl);
    }
  }
}

export const mapStateToProps = (state, ownProps) => {
  const { match } = ownProps;
  if (match.url === '/') {
    return {};
  }
  const urlState = Utils.getSearchParamsFromUrl(ownProps.location.search);
  return {
    ExperimentKeyFilterString: urlState.experimentid === undefined ? '' : urlState.experimentid,
    TagKeyFilterString: urlState.platform === undefined ? '' : urlState.platform,
  };
};

const mapDispatchToProps = (dispatch) => {
  console.log("dashboard mapDispatchToProps")
  return {
    dispatchListExperimentsApi: (requestId) => {
      console.log(requestId)
      return dispatch(listExperimentsApi(requestId));
    },
  };
};

export const MilestonesPage = connect(mapStateToProps, mapDispatchToProps)(MilestonesPageImpl);