import React from 'react';
import * as THREE from 'three';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import settingsFetcher from '../../settings/settings_fetcher';
import './miniplayer.css';

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

class MiniPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {name: props.name, sequenceName : props.sequence, pixels : [], scene : null, brightness: 100, speed: 24};
		this.showPlayer.bind(this);
	}

	getSettings = () => {
		return settingsFetcher()
		.then(_ => {
			if (_.data.success) {
				this.setState(_.data.result);
				return Promise.resolve()
			}
			else {
				console.log(_);
				NotificationManager.error('An error occured while fetching the settings, check the console');
				return Promise.reject();
			}
		}).catch(_ => {console.log(_); return Promise.reject();})
	}


	showPlayer = () => {
		// === THREE.JS CODE START ===
		const container = document.querySelector('.miniplayer');
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight , 0.1, 1000 );
		const renderer = new THREE.WebGLRenderer();
		const pixels = [];

		scene.background = new THREE.Color(0xffffff);
		renderer.setSize( container.clientWidth, container.clientHeight );
		renderer.render( scene, camera );

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
					scene.add(plane);
				}
			}

			camera.position.z = (width > height ? width : height) / 3.5;
			// Skip header + map size
			let mapSize = Converter.int64.from.eight_bytes([sequence[12], sequence[13], sequence[14], sequence[15], sequence[16], sequence[17], sequence[18], sequence[19]]);
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
			this.setState({loading: false});
			container.appendChild( renderer.domElement );
		}
	}

	showLoader = () => {
		return (this.state.loading ? <img alt="loading" className="loader" src="/rolling.svg"></img> : "");
	}

	componentDidMount() {
		this.setState({loading: true});
		return this.getSettings()
		.then(_ => {
			return axios.get(this.state.server_url + '/sequences/' + this.state.sequenceName.split('.')[0])
			.then(_ => {
				if (_.data.success) {
					this.setState({sequence: _.data.result});
					this.showPlayer()
				} else {
					return Promise.reject(_);
				}
			})
			.catch(_ => console.log(_));
		})
	}

	render() {
		return (
		<div className="playerContainer">
			<NotificationContainer/>
			{this.showLoader()}
			<div className="miniplayer"></div>
		</div>);
	}
}

export default MiniPlayer;
