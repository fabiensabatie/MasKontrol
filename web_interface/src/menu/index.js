import React from 'react';
import './menu.css';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import settingsFetcher from '../settings/settings_fetcher';

class Menu extends React.Component {

	constructor() {
		super();
		this.state = { connected : true, server_url: null }
	}

	pingMask = () => {
		let self = this;
		setInterval(_ => {
			if (self.state.server_url) {
				return axios.get(self.state.pi_url + '/ping')
				.then(_ => {
					this.setState({connected: _.data && _.data.pong ? true : false})
				})
				.catch(_ => this.setState({connected: false}))
			}
		}, 1000)
	}

	kill = () => {
		return axios.get(this.state.pi_url + '/kill')
		.then(_ => {
			if (_.data.success) { this.setState(_.data.result);}
			else {
				console.log(_);
				NotificationManager.error('An error occured while killing the mask, I bet you better shut it down..');
			}
		}).catch(_ => {console.log(_);})
	}

	getSettings = () => {
		return settingsFetcher()
		.then(_ => {
			if (_.data.success) { this.setState(_.data.result);}
			else {
				console.log(_);
				NotificationManager.error('An error occured while fetching the settings, check the console');
			}
		}).catch(_ => {console.log(_);})
	}

	componentDidMount() {
		this.getSettings();
		// return this.pingMask()
	}



	render() {
		return (
			<div className="menu">
				<NotificationContainer></NotificationContainer>
				<a className="link" href="/sequences">Sequences</a>
				<a className="link" href="/converter">Asset manager</a>
				<a className="link" href="/picker">Color Picker</a>
				<img className="link right kill" alt="Kill" onClick={this.kill} src="/kill.png"></img>
				<span className={"link right " + (this.state.connected ? "connected" : "disconnected")} href="/settings">◉</span>
				<a className="link right" href="/settings">Settings</a>
				<a className="link right" href="/mapping">Mapping</a>
			</div>
		)
	}
}

export default Menu;
