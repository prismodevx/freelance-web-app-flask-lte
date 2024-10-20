import mysql.connector
from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta, date

app = Flask(__name__)

db = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'sistemav1'
}


@app.route('/')
def registros():
    return render_template('registros.html')

@app.route('/removidos')
def removidos():
    return render_template('removidos.html')

@app.route('/api/registros', methods=['GET'])
def registros_list():
    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM tabla WHERE deleted_at is NULL')

        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        cursor.close()
        connection.close()

        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, datetime):
                    row_dict[columns[i]] = value.strftime('%Y/%m/%d')
                elif isinstance(value, date):
                    row_dict[columns[i]] = value.strftime('%Y/%m/%d')
                elif isinstance(value, timedelta):
                    total_seconds = int(value.total_seconds())
                    hours, remainder = divmod(total_seconds, 3600)
                    minutes, _ = divmod(remainder, 60)
                    row_dict[columns[i]] = f'{hours:02}:{minutes:02}'
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)

        return jsonify({'ok': True, 'body': result})

    except mysql.connector.Error as err:
        return f'Error conectando a la base de datos: {str(err)}'

@app.route('/api/registros', methods=['POST'])
def registros_set():
    data = request.get_json()

    fecha = data.get('fecha')
    hora = data.get('hora')
    valor1 = data.get('valor1')
    valor2 = data.get('valor2')
    valor3 = data.get('valor3')
    valor4 = data.get('valor4')

    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()
        cursor.execute(
            'INSERT INTO tabla (fecha, hora, valor1, valor2, valor3, valor4) VALUES (%s, %s, %s, %s, %s, %s)',
            (fecha, hora, valor1, valor2, valor3, valor4))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'ok': True, 'message': 'Registro guardado con éxito'}), 201
    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'message': f'Error en la conexión a la base de datos: {str(err)}'}), 500

@app.route('/api/registros/<int:id>', methods=['GET'])
def registros_get(id):
    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM tabla WHERE id = %s', (id,))
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        cursor.close()
        connection.close()

        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, datetime):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                elif isinstance(value, date):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                elif isinstance(value, timedelta):
                    total_seconds = int(value.total_seconds())
                    hours, remainder = divmod(total_seconds, 3600)
                    minutes, _ = divmod(remainder, 60)
                    row_dict[columns[i]] = f'{hours:02}:{minutes:02}'
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)

        if result:
            return result[0]
        else:
            return jsonify({'ok': False, 'message': 'Registro no encontrado'}), 404
    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'message': str(err)}), 500

@app.route('/api/registros/<int:id>', methods=['PUT'])
def registros_update(id):
    data = request.get_json()

    fecha = data.get('fecha')
    hora = data.get('hora')
    valor1 = data.get('valor1')
    valor2 = data.get('valor2')
    valor3 = data.get('valor3')
    valor4 = data.get('valor4')

    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()

        cursor.execute('UPDATE tabla SET fecha=%s, hora=%s, valor1=%s, valor2=%s, valor3=%s, valor4=%s WHERE id=%s',
                       (fecha, hora, valor1, valor2, valor3, valor4, id))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'ok': True, 'message': 'Registro actualizado con éxito'}), 200
    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'message': f'Error en la conexión a la base de datos: {str(err)}'}), 500

@app.route('/api/registros/<int:id>', methods=['PATCH'])
def registros_delete(id):
    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()

        cursor.execute('UPDATE tabla SET deleted_at = NOW() WHERE id = %s', (id,))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'ok': True, 'message': 'Registro eliminado con éxito'}), 200
    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'message': f'Error en la conexión a la base de datos: {str(err)}'}), 500

@app.route('/api/removidos', methods=['GET'])
def removidos_list():
    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM tabla WHERE deleted_at is not NULL')

        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        cursor.close()
        connection.close()

        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, datetime):
                    row_dict[columns[i]] = value.strftime('%Y/%m/%d')
                elif isinstance(value, date):
                    row_dict[columns[i]] = value.strftime('%Y/%m/%d')
                elif isinstance(value, timedelta):
                    total_seconds = int(value.total_seconds())
                    hours, remainder = divmod(total_seconds, 3600)
                    minutes, _ = divmod(remainder, 60)
                    row_dict[columns[i]] = f'{hours:02}:{minutes:02}'
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)

        return jsonify({'ok': True, 'body': result})
    except mysql.connector.Error as err:
        return f'Error conectando a la base de datos: {str(err)}'

@app.route('/api/removidos/<int:id>', methods=['PATCH'])
def removidos_restore(id):
    try:
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()

        cursor.execute('UPDATE tabla SET deleted_at = null WHERE id = %s', (id,))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'ok': True, 'message': 'Registro restaurado con éxito'}), 200

    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'message': f'Error en la conexión a la base de datos: {str(err)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)
