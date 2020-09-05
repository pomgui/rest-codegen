
# OpenApi typescript code generator for Pomgui Rest

Another code generator from [OpenAPI-specification](https://www.openapis.org/).

The generated code uses the [@pomgui/rest](https://github.com/pomgui/rest) library as base for the REST services. This library uses decorators to improve the reading and writing of REST services source code.

## Installation

Use npm to install @pomgui/rest-codegen.

```bash
npm install -g @pomgui/rest-codegen
```

## Usage

```bash
Usage:
  picodegen [options] openapiSpec.yaml
Options:
--version Show the version of the tool
--type    Type angular|express of the generated code (default: express)
--out     Application root path (default ".")
--src     Code output path relative to root (default "src")
--custom  Custom template path (overrides --type)
```

## Example

### OpenApi spec input

```yaml
...
/pet/findByStatus:
  get:
    tags:
    - "pet"
    summary: "Finds Pets by status"
    description: "Multiple status values can be provided with comma separated strings"
    operationId: "findPetsByStatus"
    produces:
    - "application/xml"
    - "application/json"
    parameters:
    - name: "status"
    in: "query"
    description: "Status values that need to be considered for filter"
    required: true
    type: "array"
    items:
      type: "string"
      enum:
      - "available"
      - "pending"
      - "sold"
      default: "available"
    collectionFormat: "multi"
    responses:
    200:
      description: "successful operation"
      schema:
      type: "array"
      items:
        $ref: "#/definitions/Pet"
    400:
      description: "Invalid status value"
...
```

### Server generated code

```typescript
/**    
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 */
@PiGET('/pet/findByStatus')
async findPetsByStatus(params: param.FindPetsByStatusParams, extra: PiExtraParams): Promise<model.Pet[]> {
    if(/*condition*/false)
        throw new PiError('Invalid status value', 400);
    let value: model.Pet[] = <model.Pet[]> [];
    /* fill 'value' here */
    return value;
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)