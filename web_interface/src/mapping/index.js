import React from 'react';
import Menu from '../menu';
import Grid from './grid';
import './mapping.css'

class Mapping extends React.Component {

	render() {
		return (
		<div>
			<Menu></Menu>
			<div className="mainBody">
				<div className="mapper">
					<Grid></Grid>
				</div>
			</div>

		</div>);
	}
}

export default Mapping;
