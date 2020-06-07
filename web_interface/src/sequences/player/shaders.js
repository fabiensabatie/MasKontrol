import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider from 'react-input-slider';
import * as THREE from 'three';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import settingsFetcher from '../../settings/settings_fetcher';

var rgbToHex = function (rgb) {
	var hex = Number(rgb).toString(16);
	if (hex.length < 2) hex = "0" + hex;
	return hex;
};

var fullColorHex = function(r,g,b) {
	var red = rgbToHex(r);
	var green = rgbToHex(g);
	var blue = rgbToHex(b);
	return parseInt('0x' + red+green+blue);
};

const Converter = {
	int64 : {
		to : {
			eight_bytes : (int64) => {
				let y = Math.floor(int64/2**32);
				return [y,(y<<8),(y<<16),(y<<24), int64,(int64<<8),(int64<<16),(int64<<24)].map(z=> z>>>24)
			}
		},
		from : {
			eight_bytes : (byteArr) => byteArr.reduce((a,c,i)=> a+c*2**(56-i*8),0)
		}
	}
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ShaderPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {name: props.name, sequence : props.sequence, pixels : [], scene : null, brightness: 100, speed: 24};
		this.showPlayer.bind(this);
	}

	handleSlider = (name, value) => {
		this.setState({[name] : value});
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

	update = (name) => {
		return axios.put(this.state.server_url + '/sequences/' + this.state.name, {brightness: this.state.brightness, speed: this.state.speed})
		.then(_ => {
			if (_.data.success) NotificationManager.success('Sequence updated.');
			else {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			}
		}).catch(_ => {
			console.log(_);
			NotificationManager.error('An error occured, check the console');
		})
	}

	showPlayer = () => {


		// === THREE.JS CODE START ===
		const container = document.querySelector('.player');
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight , 0.1, 1000 );
		const renderer = new THREE.WebGLRenderer();
		const pixels = [];

		scene.background = new THREE.Color(0xffffff);
		renderer.setSize( container.clientWidth, container.clientHeight );
		renderer.render( scene, camera );
		container.appendChild( renderer.domElement );

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		window.addEventListener( 'resize', onWindowResize, false );

		let self = this;
		let sequence = this.state.sequence.data;
		if (sequence && sequence[8] && sequence[9]) {
			// The 8 first bytes are dedicated to the number of frames, we can skip them
			let width  = sequence[8];
			let height = sequence[9];
			this.setState({brightness : sequence[10], speed: sequence[11]})

			for (let y = height; y > 0; y--) {
				for (let x = 0; x < width; x++) {
					let geometry = new THREE.PlaneGeometry(1,1,1);
					let material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
					let plane    = new THREE.Mesh(geometry, material);
					plane.position.x = x - width / 2;
					plane.position.y = y - height / 2;
					pixels.push(plane)
					// Add a simple grid of Nodes
					scene.add(plane);
				}
			}

			camera.position.z = (width > height ? width : height) / 2;
			// Skip header + map size
			let mapSize = Converter.int64.from.eight_bytes([sequence[12], sequence[13], sequence[14], sequence[15], sequence[16], sequence[17], sequence[18], sequence[19]]);
			console.log('MAP SIZE:', mapSize)
			let index = 12 + 8 + mapSize * 8;
			var animate = async () => {
				pixels.map((pixel) => {
					pixel.material.color.setHex(fullColorHex(Math.floor(sequence[index] * self.state.brightness/100), Math.floor(sequence[index+1] * self.state.brightness/100), Math.floor(sequence[index+2] * self.state.brightness/100)) )
					index += 3;
					return true;
				})
				await sleep(1000/self.state.speed)
				if (index === sequence.length) index = 12 + 8 + mapSize * 8;
				requestAnimationFrame(animate);
				renderer.render( scene, camera );
			};
			animate();
		}
	}

	playOnMask = () => {
		NotificationManager.info('Playing on mask');
		return axios.post(this.state.server_url + '/sequences/play/' + this.state.name)
		.then(_ => {
			if (!_.data.success) {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			}
		}).catch(_ => {
			console.log(_);
			NotificationManager.error('An error occured, check the console');
		})
	}

	streamOnMask = () => {
		NotificationManager.info('Streaming on mask');
		return axios.post(this.state.server_url + '/sequences/stream/' + this.state.name)
		.then(_ => {
			if (!_.data.success) {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			}
		}).catch(_ => {
			console.log(_);
			NotificationManager.error('An error occured, check the console');
		})
	}

	componentDidMount() {
		this.getSettings().then(this.showPlayer).catch()
	}


	render() {
		return (
		<div>
			<NotificationContainer/>
			<Form className="form mt30">
				<Row>
					<Col>
						<Form.Label className="label">Brightness :</Form.Label>
						<Slider axis="x" onChange={(coords) => this.handleSlider('brightness', coords.x)}  x={this.state.brightness} />
					</Col>
					<Col>
						<Form.Label className="label">Playback speed :</Form.Label>
						<Slider axis="x" onChange={(coords) => this.handleSlider('speed', coords.x)} x={this.state.speed} />
					</Col>
				</Row>
				<Button variant="success right mt20" onClick={this.update}>Apply</Button>
				<Button variant="primary right mt20 mr20" onClick={this.playOnMask}>Play on mask</Button>
				<Button variant="primary right mt20 mr20" onClick={this.streamOnMask}>Stream on mask</Button>
			</Form>
			<div className="player"></div>
		</div>);
	}
}

export default ShaderPlayer;
