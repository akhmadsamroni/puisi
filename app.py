from flask import Flask, render_template, request, redirect, url_for, flash, session
from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
from flask_mysqldb import MySQL
from flask import send_file
from werkzeug.security import check_password_hash, generate_password_hash
# from flask_share import Share
import datetime
import base64
import os
import string
import logging

app = Flask(__name__)
app.config['DEBUG'] = True
app.secret_key = 'kunci rahasia'

generator = pipeline(
    task='text-generation',
    model='./finetune',
    tokenizer='./finetune'
)
# koneksi database
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "puisi"
app.config["MYSQL_CURSORCLASS"] = "DictCursor"
# app.config["MYSQL_CUSTOM_OPTIONS"] = {"ssl": {"ca": "/path/to/ca-file"}}  # https://mysqlclient.readthedocs.io/user_guide.html#functions-and-attributes

mysql = MySQL(app)



@app.route('/', methods=('GET', 'POST'))
def index():
    if 'loggedin' in session and session['loggedin']:
        # Pengguna sudah login, arahkan ke halaman homepage
        return redirect(url_for('homepage'))
    
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        # cek data username
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email=%s', (email, ))
        akun = cursor.fetchone()
        if akun is None:
            flash('Login Gagal, Cek Username Anda', 'danger')
        elif not check_password_hash(akun['password'], password):
            flash('Login gagal, Cek Password Anda', 'danger')
        else:
            session['loggedin'] = True
            session['image'] = akun['image']
            session['username'] = akun['username']
            session['email'] = akun['email']
            session['id'] = akun['id']
            session['password'] = akun['password']
            session['level'] = akun['level']

            return redirect(url_for('homepage'))
    return render_template('index.html')


@app.route("/homepage")
def homepage():
    if 'loggedin' in session:
        return render_template('homepage.html')
    flash('Harap Login dulu', 'danger')
    return redirect(url_for('index'))


@app.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        level = 'user'
        tanggal_register = datetime.datetime.now()
        tanggal_update = datetime.datetime.now()

        # cek username atau email
        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT * FROM users WHERE username=%s OR email=%s', (username, email, ))
        akun = cursor.fetchone()
        if akun:
            flash('Username atau email sudah ada', 'danger')
        else:
            cursor.execute('''
                INSERT INTO users (username, email, password, level, tanggal_register, tanggal_update)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (username, email, generate_password_hash(password), level, tanggal_register, tanggal_update))
            mysql.connection.commit()
            flash('Registrasi Berhasil', 'success')
        cursor.close()
    return render_template('index.html')

# logout


@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('username', None)
    session.pop('level', None)
    return redirect(url_for('index'))


@app.route('/list_puisi')
def list_puisi():
    if session['level'] == "user":
        username = session['username']
        # Mengambil data pengguna yang ingin ditampilkan
        cur = mysql.connection.cursor()
        cur.execute('''
        SELECT u.username, l.id, l.judul, l.author, l.tanggal_pembuatan, l.tanggal_update, l.puisi
        FROM users u
        JOIN list_puisi l ON u.username = l.author
        WHERE u.username = %s''', (username,))
        data = cur.fetchall()
        cur.close()
        return render_template('list_puisi.html', data=data)
    elif session['level'] == "admin":
        cur = mysql.connection.cursor()
        cur.execute('''SELECT * FROM list_puisi''')
        data = cur.fetchall()
        cur.close()
        return render_template('list_puisi.html', data=data)


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/output', methods=['POST'])
def output():
    if request.method == 'POST' and "hasil_puisi" in request.form:
        isi = request.form['hasil_puisi']
        maxlength = int(request.form['max_length'])
        output = generator(
            isi,
            max_length=maxlength,  # max token to generate
            # jumlah balok skor tertinggi yang harus dikembalikan ? jumlah sample yang ingin dikeluarkan sesuai yang didefinisikan
            num_return_sequences=1,
            # repetition_penalty=1.0,  # mencegah kata pengulangan
            # temperature=2.0,  # untuk mengatur probability next word
            # top_k=50,  # ambil top kata dengan probability tertinggi / kata yang paling mungkin
            # top_p=0.95,  # ambil kata dan jumlah kan probalitiy nya sesuai yang di definisikan
            # # agar tidak ada 2 gram/kata yang muncul dua kali:
            # no_repeat_ngram_size=2,
            # do_sample=True,  # menggunakan teknik sampling
            # early_stopping=False,  # menghasilkan output sampai max_length terpenuhi
            # num_beams=5,  # menggunakan teknik beam search dengan jumlah balok sebanyak 5
        )

        # Converting list to string and removing newline chars
        string = ""
        for i in output:
            string += str(i)
            n = len(string)
            string = string[20:n-2]
            string = string.replace('\\n', '')
            # string = ' '.join(string.split()).upper() + '\n' # hapus white space dan ubah judul kata ke huruf besar
            return render_template('output.html', hasil_puisi=string)
    elif request.method == 'POST':
        puisi = request.form['puisi']
        judul = request.form['judul']
        author = session['username']
        tanggal_pembuatan = datetime.datetime.now()
        tanggal_update = datetime.datetime.now()
        cur = mysql.connection.cursor()
        cur.execute('''INSERT INTO list_puisi (puisi,judul,author,tanggal_pembuatan,tanggal_update) VALUES (%s,%s,%s,%s,%s)''',
                    (puisi, judul, author, tanggal_pembuatan, tanggal_update))
        mysql.connection.commit()
        cur.close()
        return redirect(url_for('lihat', id=session['id']))


@app.route('/lihat/<id>')
def lihat(id):
    cur = mysql.connection.cursor()

    if request.referrer.endswith('/output'):
        cur.execute('''
            SELECT *
            FROM list_puisi
            WHERE author = %s
            ORDER BY tanggal_pembuatan DESC
            LIMIT 1''', (session['username'],))
        lht = cur.fetchone()
        cur.close()
        return render_template('lihat.html', lht=lht)
    else:
        cur.execute('''SELECT * FROM list_puisi WHERE id = %s''', (id,))
        lht = cur.fetchone()
        cur.close()
        return render_template('lihat.html', lht=lht)


@app.route('/list_users')
def list_users():
    cur = mysql.connection.cursor()
    cur.execute('''SELECT * FROM users''')
    l_users = cur.fetchall()
    cur.close()
    return render_template('list_users.html', l_users=l_users)


@app.route('/edit_user/<id>', methods=['GET', 'POST'])
def edit_user(id):
    if request.method == 'GET':
        if request.referrer and request.referrer.endswith('/list_users'):
            cur = mysql.connection.cursor()
            cur.execute('''
            SELECT * 
            FROM users  
            WHERE id = %s''', (id, ))
            user = cur.fetchone()
            cur.close()

            return render_template('edit_user.html', user=user)
        elif request.referrer and '/account/' in request.referrer:
            username = session['username']
            cur = mysql.connection.cursor()
            cur.execute('''
                SELECT *
                FROM users
                WHERE id = %s
            ''', (username,))
            user = cur.fetchone()
            cur.close()
            return render_template('edit_user.html', user=user)
        else:
            return redirect(request.referrer)

    elif request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        level = 'user'
        tanggal_update = datetime.datetime.now()

        cur = mysql.connection.cursor()

        cur.execute(''' 
        UPDATE users 
        SET 
            username = %s,
            email = %s,
            password = %s,
            level = %s,
            tanggal_update =%s
        WHERE
            id = %s;
        ''', (username, email, generate_password_hash(password), level, tanggal_update, id))

        mysql.connection.commit()
        user = cur.fetchone()
        cur.close()
        session['username'] = username
        session['email'] = email
        flash('Edit berhasil', 'success')
        if session['level'] == "admin":
            return redirect(url_for('list_users', user=user))
        else:
            return redirect(url_for('account', username=session['username']))
    else:
        return redirect(request.referrer)


@app.route('/delete/<id>', methods=["GET"])
def delete(id):
    cur = mysql.connection.cursor()
    cur.execute('''DELETE FROM users WHERE id=%s''', (id, ))
    mysql.connection.commit()
    cur.close()
    flash('data Berhasil di Hapus', 'success')
    return redirect(url_for('list_users'))


@app.route('/account/<username>')
def account(username):
    username = session['username']
    return render_template('account.html', username=username)


@app.route('/edit_puisi/<id>', methods=['GET', 'POST'])
def edit_puisi(id):
    if request.method == 'GET':
        cur = mysql.connection.cursor()
        cur.execute('''
        SELECT * 
        FROM list_puisi  
        WHERE id = %s''', (id, ))
        data_puisi = cur.fetchone()
        cur.close()

        return render_template('edit_puisi.html', data_puisi=data_puisi)
    elif request.method == 'POST':
        judul = request.form['judul']
        author = request.form['author']
        # tanggal_pembuatan = datetime.datetime.now()
        tanggal_update = datetime.datetime.now()
        puisi = request.form['puisi']
        cur = mysql.connection.cursor()

        cur.execute(''' 
        UPDATE list_puisi 
        SET 
            judul = %s,
            author = %s,
            tanggal_update =%s,
            puisi = %s
            
        WHERE
            id = %s;
        ''', (judul, author, tanggal_update, puisi, id))

        mysql.connection.commit()
        cur.close()
        flash('Edit berhasil', 'success')
        return redirect(url_for('list_puisi', username=session['username']))


@app.route('/delete_puisi/<id>', methods=["GET"])
def delete_puisi(id):
    cur = mysql.connection.cursor()
    cur.execute('''DELETE FROM list_puisi WHERE id=%s''', (id,))
    mysql.connection.commit()
    cur.close()
    flash('data Berhasil di Hapus', 'success')
    return redirect(url_for('list_puisi', username=session['username']))


@app.route('/demo')
def demo():
    return render_template('demo.html')


if __name__ == "__main__":
    app.run(debug=True)
