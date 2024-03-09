from flask import Flask, request, jsonify
from flask_cors import CORS
from psycopg2 import connect
from collections import defaultdict

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/fukushima', methods=['GET'])
def fukushima_geojson():
    # Récupérer les paramètres de requête filtrés
    annee = request.args.get('annee')
    zone = request.args.get('zone')
    statut = request.args.get('options')

    #construire la clause where pour filtrer la requête
    where_clause = ""
    if zone:
        if statut and (statut != 'all' or statut is not None):
            where_clause = f"AND zone = '{zone}' AND statut = '{statut}'"
        else:
            where_clause = f"AND zone = '{zone}'"
    elif statut and (statut != 'all' or statut is not None):
        where_clause = f"AND statut = '{statut}'"

    # Construire la requête SQL en utilisant la clause WHERE
    sql = f"""
    WITH t AS ( 
        SELECT count(1) AS id_dilem_counts, geom
        FROM proj_geonum.consensus_fukushima 
        WHERE annee = %s {where_clause}
        GROUP BY geom 
    ),
    other AS (
        SELECT DISTINCT geom
        FROM proj_geonum.consensus_fukushima
        EXCEPT 
        SELECT geom FROM t
    ),
    res AS (
        SELECT id_dilem_counts, geom FROM t 
        UNION ALL 
        SELECT 0 AS id_dilem_counts, geom FROM other
    )
    SELECT
        MIN(id_dilem_counts) AS min_count,
        MAX(id_dilem_counts) AS max_count,
        json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg( st_AsGeoJson(res.*)::json)
        ) AS geojson
    FROM res
    """

    # Afficher la requête SQL
    print("Requête SQL pour consensus_fukushima:", sql)

    # Exécuter la requête SQL
    with connect("service=local_geonum") as con:
        cur = con.cursor()
        cur.execute(sql, (annee,))
        row = cur.fetchone()
        min_count, max_count, geojson = row

    print("min_count pour consensus_fukushima:", min_count, "max_count pour consensus_fukushima:", max_count)
    return jsonify({'min_count': min_count, 'max_count': max_count, 'geojson': geojson})


# Endpoint pour récupérer les données filtrées pour la couche consensus_japon
@app.route('/japon', methods=['GET'])
def japon_geojson():
    # Récupérer les paramètres de requête filtrés
    annee = request.args.get('annee')
    zone = request.args.get('zone')
    statut = request.args.get('options')

    #construire la clause where pour filtrer la requête
    where_clause = ""
    if zone:
        if statut and (statut != 'all' or statut is not None):
            where_clause = f"AND zone = '{zone}' AND statut = '{statut}'"
        else:
            where_clause = f"AND zone = '{zone}'"
    elif statut and (statut != 'all' or statut is not None):
        where_clause = f"AND statut = '{statut}'"

    
    # Construire la requête SQL en fonction des paramètres de requête pour la couche consensus_japon
    sql = f"""
    WITH t AS ( 
    SELECT count(1) AS id_dilem_counts, geom
    FROM proj_geonum.consensus_japon 
    WHERE annee = %s {where_clause}
    GROUP BY geom 
),
other AS (
    SELECT DISTINCT geom
    FROM proj_geonum.consensus_japon
    EXCEPT 
    SELECT geom FROM t
),
res AS (
    SELECT id_dilem_counts, geom FROM t 
    UNION ALL 
    SELECT 0 AS id_dilem_counts, geom FROM other
)
    SELECT
        MIN(id_dilem_counts) AS min_count,
        MAX(id_dilem_counts) AS max_count,
        json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg( st_AsGeoJson(res.*)::json)
        ) AS geojson
    FROM res
    """
    # Vérifier si statut est 'all' ou None pour inclure tous les statuts dans la requête SQL
    if statut == 'all' or statut is None:
        sql = sql.format("")
    else:
        sql = sql.format("AND statut = %s")

    # Ajouter un print pour afficher la requête SQL
    print("Requête SQL pour consensus_japon:", sql)

    # Exécuter la requête SQL
    with connect("service=local_geonum") as con:
        cur = con.cursor()
        cur.execute(sql, (annee,))
        row = cur.fetchone()
        min_count, max_count, geojson = row
    
    print("min_count pour consensus_japon:", min_count, "max_count pour consensus_japon:", max_count)
    return jsonify({'min_count': min_count, 'max_count': max_count, 'geojson': geojson})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
