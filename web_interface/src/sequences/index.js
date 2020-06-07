import './sequences.css';
import React     from 'react';
import Menu      from '../menu';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import settingsFetcher from '../settings/settings_fetcher';
import AssetManager from '../asset_manager';

class Sequences extends React.Component {

	constructor() {
		super();
		this.state = {
			sequences : [],
			current : {},
			currentIndex: undefined
		}
	}

	getSettings = () => {
		return settingsFetcher()
		.then(_ => {
			if (_.data.success) { this.setState(_.data.result); return Promise.resolve()}
			else {
				console.log(_);
				NotificationManager.error('An error occured while fetching the settings, check the console');
				return Promise.reject();
			}
		}).catch(_ => {console.log(_); return Promise.reject();})
	}


	componentDidMount() {
		this.getSettings()
	}


	render() {
		return (<div>
			<NotificationContainer></NotificationContainer>
			<Menu></Menu>
			<div className="mainBody">
				<AssetManager sequencer={true}></AssetManager>
			</div>
		</div>);
	}
}

export default Sequences;
