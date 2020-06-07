import React from 'react';
import './mapping.css'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import * as THREE from 'three';
import settingsFetcher from '../settings/settings_fetcher';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

let PIXELS = [];
let SAVE = false;

class Grid extends React.Component {



	constructor() {
		super();
		this.state = { mode : 'painting', PIXELS : [], map: [], saveGrid : false }
	}

	getSettings = () => {
		return settingsFetcher()
		.then(_ => {
			console.log('Res', _.data.result)
			if (_.data.success) this.setState(_.data.result);
			else {
				console.log(_);
				NotificationManager.error('An error occured while fetching the settings, check the console');
				return Promise.reject();
			}
			console.log(_.data.result)
			return Promise.resolve(_);
		}).catch(_ => {console.log(_);})
	}

	updateMap = (map) => {
		return this.getSettings()
		.then(_ => {
			let settings = {};
			if (_.data.success) settings = _.data.result;
			settings.map = map;
			return axios.post(this.state.server_url + '/settings', {settings : settings})
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
		})

	}

	saveGrid = () => {
		SAVE = true;
		console.log('Saving')
	}



	showGrid = () => {
		/* =====================================================================
		DEFINING VARIABLES
		===================================================================== */
		const container = document.querySelector('.mapper');
		if (!container) return;
		const self      = this;
		const scene     = new THREE.Scene();
		const camera    = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight , 0.1, 1000 );
		const renderer  = new THREE.WebGLRenderer();
		const raycaster = new THREE.Raycaster();
		const mouse     = new THREE.Vector2();
		const width     = this.state.width;
		const height    = this.state.height;
		const lines     = [];
		let PAINTING    = false;

		/* =====================================================================
		ASSIGNING VALUES
		===================================================================== */
		scene.background = new THREE.Color(0xffffff);
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.render(scene, camera);
		container.appendChild(renderer.domElement);
		camera.position.z = (width > height ? width : height) / 1.5;


		/* =====================================================================
		EVENT LISTENERS
		===================================================================== */
		const onMouseDown = (event) => {
			event.preventDefault();
			PAINTING = event.button === 0 ? 'paint' : 'unpaint';
		}
		const onMouseUp = (event) => {
			event.preventDefault();
			PAINTING = false;
		}

		const onMouseMove = (event) => {
			mouse.x = ((event.clientX -renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
			mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		window.addEventListener('resize', onWindowResize, false);
		renderer.domElement.addEventListener('mousemove', onMouseMove, false);
		renderer.domElement.addEventListener('mousedown', onMouseDown, false);
		renderer.domElement.addEventListener('mouseup',   onMouseUp  , false);
		renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());

		/* =====================================================================
		GRID BUILDING
		===================================================================== */
		console.log('here')
		let index = 0;
		for (let y = height; y > 0 ; y--) {
			for (let x = 0; x < width; x++) {
				let geometry = new THREE.PlaneGeometry(1,1,1);
				let material = new THREE.MeshBasicMaterial({color: self.state.map.includes(index) ? 0xff0000 : 0xffffff, side: THREE.DoubleSide});
				let plane    = new THREE.Mesh(geometry, material);
				let edges = new THREE.EdgesGeometry(geometry);
				let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000 }));
				plane.position.x = line.position.x = x - width / 2;
				plane.position.y = line.position.y = y - height / 2;
				plane.index      = line.index      = index++;
				PIXELS.push(plane)
				lines.push(line)
				scene.add(plane);
				scene.add(line);
			}
		}

		function save() {
			let strip = [];
			for (let y = 0; y < height; y++) {
				if (!(y % 2)) {
					for (let x = 0; x < width; x++) {
						let idx = (width * y + x);
						if (PIXELS[idx].material.color.getHex() === 0xff0000) strip.push(PIXELS[idx]);
					}
				} else {
					for (let x = width - 1; x >= 0; x--) {
						let idx = (width * y + x);
						if (PIXELS[idx].material.color.getHex() === 0xff0000) strip.push(PIXELS[idx]);
					}
				}
			}
			SAVE = false;
			self.updateMap(strip.map(p => p.index));
			return;

		}


		/* =====================================================================
		GRID RENDERING
		===================================================================== */

		function render() {
			renderer.render( scene, camera );
			raycaster.setFromCamera( mouse, camera );
			const intersects = raycaster.intersectObjects(scene.children.filter(child => child.type === 'Mesh'));
			if (intersects.length > 0) {
				let pixel = intersects[0].object;
				if (PAINTING === 'paint') { pixel.material.color.setHex(0xff0000);}
				if (PAINTING === 'unpaint') { pixel.material.color.setHex(0xffffff);};
				if (SAVE) save();
			}
			requestAnimationFrame(render);
		}

		render();
	}

	componentDidMount() { this.getSettings(); }
	render() {
		return (
		<div>
		<NotificationContainer></NotificationContainer>
			<Button className="primary" onClick={this.saveGrid}>Save map</Button>
			{this.showGrid()}
		</div>); }
}

export default Grid;
