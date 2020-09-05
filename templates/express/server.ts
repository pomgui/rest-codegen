import { PiService } from '@pomgui/rest';
import { PiDatabasePool } from '@pomgui/database';
import { servicesList } from './{{ src-dir }}/service';
import { Logger } from 'sitka';
import express from 'express';

// Create a new express application instance
const _app = express();
const _port = parseInt(process.env.PORT || '8080');
const _logger = Logger.getLogger('main');

main();

function main() {
    _app.use(express.json());
    _app.use('{{base-path}}', PiService({ servicesList, dbPool: _createDbPool() }));

    // Serve the application at the given port
    _app.listen(_port, () => {
        _logger.info(`Listening at http://localhost:${_port}/`);
    });
}

function _createDbPool(): PiDatabasePool | undefined {
    // Returns a new connection or "undefined" if no database connection is required
    return undefined;

    // Example1:
    // return new PiMySqlDatabasePool({
    //     host: 'localhost',
    //     user: 'appuser',
    //     password: 'appsecret',
    //     database: 'appdb'
    // }, 10);

    // Example2:
    // return new PiFirebirdDatabasePool({
    //     host: 'localhost',
    //     user: 'appuser',
    //     password: 'appsecret',
    //     database: 'appdb.fdb'
    // }, 10);
}
