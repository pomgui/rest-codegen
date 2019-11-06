import express from 'express';
import { PiDatabase, PiMySqlDatabase, PiService } from 'pirest';
import { services } from '{{service.dir}}';

// Create a new express application instance
const app: express.Application = express();
const port: number = parseInt(process.env.PORT || '8080');

main();

function main() {
    app.use(express.json());
    app.use('{{openapi.basePath}}', PiService({ services, dbFactoryFn }));

    // Serve the application at the given port
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}/`);
    });
}

function dbFactoryFn(): PiDatabase | null {
    {{^cfg.other.mysqlConn}}
    // Returns a new connection or null if no database connection is required
    return null;
    
    // Example1:
    // return new PiMySqlDatabase({
    //     host: 'localhost',
    //     user: 'appuser',
    //     password: 'appsecret',
    //     database: 'appdb'
    // });

    // Example2:
    // return new PiMySqlDatabase('mysql://appuser:appsecret@localhost/appdb')
    {{/cfg.other.mysqlConn}}
    {{#cfg.other.mysqlConn}}
    return new PiMySqlDatabase('{{.}}');
    {{/cfg.other.mysqlConn}}
}
