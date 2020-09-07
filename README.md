
# OpenApi typescript code generator

Another code generator from [OpenAPI-specification 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md).

The generated code uses the [@pomgui/rest](https://github.com/pomgui/rest) library as base for the REST services. This library uses [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to improve the reading and writing of REST services source code.

## Installation

```bash
npm install -g @pomgui/rest-codegen
```

## Usage

```
  rest-codegen --config file.conf.js [project1...]
```

## Example

### OpenApi spec input

```yaml
...
/pet/findByStatus:
  get:
    tags:
    - pet
    summary: Finds Pets by status
    description: Multiple status values can be provided with comma separated strings
    operationId: findPetsByStatus
    produces:
    - application/json
    parameters:
    - name: status
      in: query
    description: Status values that need to be considered for filter
    required: true
    type: array
    items:
      type: string
      enum:
      - available
      - pending
      - sold
      default: available
    collectionFormat: multi
    responses:
    200:
      description: successful operation
      schema:
        type: array
        items:
          $ref: '#/definitions/Pet'
    400:
      description: Invalid status value
    ...
```

### Express generated code

#### Service files

```typescript
/**    
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 */
@PiGET('/pet/findByStatus')
async findPetsByStatus(params: FindPetsByStatusParams): Promise<Pet[]> {
    if(/*condition*/false)
        throw new PiError('Invalid status value', 400);
    let value: Pet[] = <Pet[]> [];
    /* fill 'value' here */
    return value;
}
```

#### Service parameter files

```typescript
/** Parameters sent in the query */
export interface FindPetsByStatusParamsQuery  {
    /**    
     * Status values that need to be considered for filter
     */
    status: ('available'|'pending'|'sold')[];
}
/** Structure with ALL the operation parameters */
export interface FindPetsByStatusParams extends FindPetsByStatusParamsQuery { }
```

#### Service model files

```typescript
export interface Pet {
    id?: number;
    category?: Category;
    name: string;
    photoUrls: string[];
    tags?: Tag[];
    status?: 'available'|'pending'|'sold';
}
```

## Configuration file

The configuration file defines the way the code will be generated. 
All the projects will be altered.

Example: If you have two projects: angular and express, probably both share the same DTOs and define the same Rest API calls, so they will need be sync'ed when the swagger file changes.

### Example

```javascript
module.exports = {
  beforeAll: 'clean',
  file: './pets.swagger.yaml',
  projects: [
    {
      name: 'server01',
      type: 'express',
      dir: './server',
      model: {
        dir: 'openapi/model',
        suffix: 'Dto'
      },
      params: {
        dir: 'openapi/params',
        beforeAll: 'none',
        overwrite: true,
        prefix: 'Prm'
      },
      services: {
        dir: 'openapi/service',
        suffix: 'Api'
      },
      databasePool: {
        type: 'firebird',
        size: 10,
        options: {
          host: 'localhost',
          port: 3050,
          user: 'sysdba',
          password: 'masterkey',
          database: 'clients.fdb'
        }
      }
    },
    {
      name: 'clientAngular',
      type: 'angular',
      dir: 'client',
      ...
    }
  }
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to improve.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
