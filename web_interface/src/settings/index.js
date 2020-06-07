import './form.css';
import React  from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Menu from '../menu';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import settingsFetcher from './settings_fetcher';
import Slider from 'react-input-slider';

class Settings extends React.Component {

	constructor() {
		super();
		this.state = {
			server_url    : "",
			pi_url        : "",
			led_count     : "",
			gpio          : "",
			maxBrightness : "",
			width         : "",
			height        : "",
			guiBrightness : "",
			guiSaturation : "",
			guiContrast : "",
		}
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

	update = () => {
		return axios.post(this.state.server_url + '/settings', {settings : this.state})
		.then(_ => {
			if (_.data.success) NotificationManager.success('Settings updated.');
			else {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			}
		}).catch(_ => {
			console.log(_);
			NotificationManager.error('An error occured, check the console');
		})
	}

	handleSlider = (name, value) => {
		this.setState({[name] : value});
	}

	handleChange = (event) => {
		this.setState({[event.target.getAttribute('name')] : event.target.value})
	}

	componentDidMount() {
		this.getSettings()
	}

	render() {
		return (
			<div>
				<NotificationContainer/>
				<Menu></Menu>
				<div className="mainBody">
					<Form className="form">
						<Form.Group controlId="serverUrl">
							<Form.Label className="label">Server URL :</Form.Label>
							<Form.Control type="text" name="server_url" onChange={this.handleChange} value={this.state.server_url} placeholder="http://localhost:3000" />
						</Form.Group>
						<Form.Group controlId="piUrl">
							<Form.Label className="label">Raspberry Pi URL :</Form.Label>
							<Form.Control type="text" name="pi_url" onChange={this.handleChange} value={this.state.pi_url} placeholder="http://192.168.0.47:5000" />
						</Form.Group>
						<Form.Group controlId="ledCount">
							<Form.Label className="label">Led count :</Form.Label>
							<Form.Control type="number" name="led_count" onChange={this.handleChange} value={this.state.led_count} placeholder="144" />
						</Form.Group>
						<Form.Label className="label">Mask display dimensions :</Form.Label>
						<Row>
							<Col><Form.Control name="width"  onChange={this.handleChange} value={this.state.width } placeholder="Width" /></Col>
							<Col><Form.Control name="height" onChange={this.handleChange} value={this.state.height} placeholder="Height" /></Col>
						</Row>
						<Form.Group controlId="gpio">
							<Form.Label className="label">Raspberry Pi control pin :</Form.Label>
							<Form.Control type="number" name="gpio" onChange={this.handleChange} value={this.state.gpio} placeholder="18" />
						</Form.Group>
						<Form.Group controlId="maxBrightness">
							<Form.Label className="label">Maximum brightness</Form.Label>
							<Form.Control type="number" name="maxBrightness" onChange={this.handleChange} value={this.state.maxBrightness} placeholder="255" />
						</Form.Group>
						<Row className="mt30 mb20">
							<Col>
								<Form.Label className="label">Contrast :</Form.Label>
								<Slider axis="x" onChange={(coords) => this.handleSlider('guiContrast', coords.x)}  x={this.state.guiContrast} />
							</Col>
							<Col>
								<Form.Label className="label">Brightness :</Form.Label>
								<Slider axis="x" onChange={(coords) => this.handleSlider('guiBrightness', coords.x)}  x={this.state.guiBrightness} />
							</Col>
							<Col>
								<Form.Label className="label">Saturation :</Form.Label>
								<Slider axis="x" onChange={(coords) => this.handleSlider('guiSaturation', coords.x)}  x={this.state.guiSaturation} />
							</Col>
						</Row>
						<Button variant="success right mt30" onClick={this.update}>Update</Button>
					</Form>
				</div>
			</div>
		);
	}
}

export default Settings;
