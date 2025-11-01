import os
from sqlalchemy import create_engine, text
url=os.environ.get('DATABASE_URL', 'mysql+pymysql://root:root@localhost:3306/pasale_db')
print('Using DB URL:', url)
engine=create_engine(url)
with engine.connect() as conn:
    res=conn.execute(text("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products'"))
    rows=res.fetchall()
    for r in rows:
        print(r)
