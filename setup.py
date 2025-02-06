from setuptools import setup, find_packages

setup(
    name="outils_calculs",
    version="0.2",
    packages= find_packages(),
    entry_points={
        'calcul_par_lot=outils_calcul.calcul_par_lot:main',
        'calcul_par_quartier=outils_calcul.calcul_par_quartier:main'
    }
)