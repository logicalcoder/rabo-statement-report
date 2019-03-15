import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  header: {
    fontWeight: 'bold',
    fontSize: '12pt'
  },
  refCell: {
    minWidth:100, 
    maxWidth:100
  }
});

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      response: [],
      error: ''
    };
  }

  componentDidMount() {
    this.callApi()
      .then(res => {
        this.setState({ 
          response: res.report,
          error: res.error
        });
      })
      .catch(err => {
        this.setState({ error: err.message });
      });
  }

  callApi = async () => {
    const response = await fetch('/api/report');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.error);
    return body;
  };

  render() {
    const { classes } = this.props;

    return (
      <div className="App">
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell className={[classes.header, classes.refCell].join(' ')}>Transaction Reference</TableCell>
                <TableCell className={classes.header}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.response.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className={classes.refCell}>{row.Reference}</TableCell>
                  <TableCell>{row.Description}</TableCell>
                </TableRow>
              ))}
              {this.state.response.length === 0 &&
                <TableRow>
                  <TableCell colSpan={2} align="center">ZERO FAILED RECORDS FOUND</TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </Paper>

        {this.state.error !== '' &&
          <p>{this.state.error}</p>
        }
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home);