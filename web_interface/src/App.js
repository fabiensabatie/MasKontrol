import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Settings from './settings';
import Picker from './colorpicker';
import Sequences from './sequences';
import VideoConverter from './videoconverter';
import Mapping from './mapping';

class App extends React.Component {
	render() {
		return (
			<Router>
				{/* A <Switch> looks through its children <Route>s and
				renders the first one that matches the current URL. */}
				<Switch>
					{/*<Route path="/services/:id" component={Service}></Route>*/}
					{/*<Route path="/" component={ColorPicker}></Route>*/}
					<Route path="/sequences" component={Sequences}></Route>
					<Route path="/settings" component={Settings}></Route>
					<Route path="/mapping" component={Mapping}></Route>
					<Route path="/converter" component={VideoConverter}></Route>
					<Route path="/picker" component={Picker}></Route>
					<Route path="/" component={Sequences}></Route>
				</Switch>
			</Router>)
	}
}

export default App;
