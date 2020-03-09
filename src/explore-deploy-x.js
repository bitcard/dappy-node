const Ajv = require("ajv");
const rchainToolkit = require("rchain-toolkit");

const exploreDeployBodySchema = require("./explore-deploy").schema;

const log = require("./utils").log;

const ajv = new Ajv();
const schema = {
  schemaId: "explore-deploy-x",
  type: "array",
  items: exploreDeployBodySchema
};

ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));
const validate = ajv.compile(schema);

module.exports.exploreDeployXWsHandler = async (body, httpUrl) => {
  log("explore-deploy-x");

  const valid = validate(body);

  if (!valid) {
    resolve({
      success: false,
      error: {
        message: validate.errors.map(e => `body${e.dataPath} ${e.message}`)
      }
    });
    return;
  }

  const exploreDeployResponses = await Promise.all(
    body.map(b => rchainToolkit.http.exploreDeploy(httpUrl, b))
  );

  const data = exploreDeployResponses.map(r => {
    return {
      success: true,
      data: r
    };
  });

  return {
    success: true,
    data: { results: data }
  };
};
