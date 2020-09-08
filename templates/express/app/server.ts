import express from 'express';
import { PiService } from '@pomgui/rest';
{{#cfg.databasePool}}
import { Pi{{type}}Pool } from '@pomgui/database';
{{/cfg.databasePool}}
import { services } from '{{service.dir}}';
import { descriptors } from '{{params.dir}}';

// Create a new express application instance
const app = express();
const port = parseInt(process.env.PORT || '8080');
{{#cfg.databasePool}}
const options = {{options}};
{{/cfg.databasePool}}

main();

function main() {
    app.use(express.json());
    {{#cfg.databasePool}}
    app.use('{{openapi.basePath}}', PiService({ 
        services, 
        descriptors,
        dbPool: new Pi{{type}}Pool(options, {{size}}) 
    }));
    {{/cfg.databasePool}}
    {{^cfg.databasePool}}
    app.use('{{openapi.basePath}}', PiService({ services, descriptors }));
    {{/cfg.databasePool}}

    // Serve the application at the given port
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}/`);
    });
}
