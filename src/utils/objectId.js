const { ObjectId } = require('mongodb');

function paraObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Identificador inválido');
  }

  return new ObjectId(id);
}

module.exports = { paraObjectId };
