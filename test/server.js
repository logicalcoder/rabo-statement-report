let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
// Retrieve statement report
describe('Records', () => {

  // Test the /GET route
  describe('/GET report', () => {
    it('it should GET the report for all failed client statements', (done) => {
    chai.request(server)
      .get('/api/report')
      .end((err, res) => {
        if (err) { return done(err); }
      
        res.should.have.status(200);
        res.body.should.have.property('report');
        report = res.body.report;
        report.should.be.a('array');
        report.length.should.not.be.eql(0);

        done();
      });
    });
  });

});