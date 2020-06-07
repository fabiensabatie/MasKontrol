import React  from 'react';
import Menu from '../menu';
import {ChromePicker} from 'react-color';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import settingsFetcher from '../settings/settings_fetcher';


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    R: parseInt(result[1], 16),
    G: parseInt(result[2], 16),
    B: parseInt(result[3], 16)
  } : null;
}

class Picker extends React.Component {

	state = { background: '#fff' };

	handleChange = (color) => {
		this.setState({ background: color.hex });
		let mycolor = hexToRgb(color.hex)
		console.log(mycolor)
		axios.post(this.state.pi_url + '/fill', {color: mycolor})
		.then( _ => axios.post(this.state.pi_url + '/render'))
	};


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
		this.getSettings()
	}

	render() {
		return (
			<div>
				<NotificationContainer></NotificationContainer>
				<Menu></Menu>
				<div className="mainBody">
					<ChromePicker className="centered" color={this.state.background} onChange={this.handleChange}></ChromePicker>
				</div>
			</div>
		);
	}
}

export default Picker;
