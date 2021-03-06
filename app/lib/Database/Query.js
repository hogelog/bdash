import { connection } from './Connection';

export default class Query {
  static getAll() {
    return connection.all('select id, title from queries order by createdAt desc');
  }

  static find(id) {
    return connection.get('select * from queries where id = ?', id).then(query => {
      if (query.fields) {
        query.fields = JSON.parse(query.fields);
      }

      if (query.rows) {
        query.rows = JSON.parse(query.rows);
      }

      // For backword compatibility with beta version data structure.
      if (query.rows && typeof query.rows[0] === 'object' && !Array.isArray(query.rows[0])) {
        query.fields = query.fields.map(f => f.name);
        query.rows = query.rows.map(r => Object.values(r));
      }

      return query;
    });
  }

  static create({ title, dataSourceId }) {
    let sql = `
      insert into queries
      (dataSourceId, title, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;

    return connection.insert(sql, dataSourceId, title).then(id => {
      return { id, dataSourceId, title };
    });
  }

  static update(id, params) {
    let fields = [];
    let values = [];

    Object.keys(params).forEach(field => {
      fields.push(field);
      values.push(params[field]);
    });
    values.push(id);

    let sql = `
      update queries
      set ${fields.map(f => `${f} = ?`).join(', ')}, updatedAt = datetime('now')
      where id = ?
    `;

    return connection.run(sql, values);
  }

  static del(id) {
    return connection.run('delete from queries where id = ?', id);
  }
}
