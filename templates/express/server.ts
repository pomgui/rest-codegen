import express from 'express';
import { PiDatabase, PiMySqlDatabase, PiService } from 'piservices';
import { {{service-classes}} } from './src/service';

// Create a new express application instance
const app: express.Application = express();
const port: number = parseInt(process.env.PORT || '8080');
const services = [{{ service-classes }}];

main();

function main() {
    app.use(express.json());
    app.use('{{base-path}}', PiService({ services, dbFactoryFn }));

    // Serve the application at the given port
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}/`);
    });
}

function dbFactoryFn(): PiDatabase | null {
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
}
