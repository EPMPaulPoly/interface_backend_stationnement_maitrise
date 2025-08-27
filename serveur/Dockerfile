FROM node:20
WORKDIR /app/serveur

COPY serveur/package*.json ./
COPY serveur/tsconfig.json ./
COPY serveur_calcul_python/environment.yml ../serveur_calcul_python/environment.yml

RUN ls -l /app/serveur
RUN ls -l /app/serveur_calcul_python
# Install needed packages (wget)
RUN apt-get update && apt-get install -y ca-certificates wget


# Installer Miniconda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh && \
    bash /tmp/miniconda.sh -b -p /opt/conda && \
    rm /tmp/miniconda.sh && \
    ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
    echo "conda activate base" >> ~/.bashrc

# Configurer Conda
SHELL ["/bin/bash", "-c"]
RUN /opt/conda/bin/conda config --set show_channel_urls yes
RUN /opt/conda/bin/conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main && \
    /opt/conda/bin/conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r && \
    /opt/conda/bin/conda update -n base -c defaults conda
RUN /opt/conda/bin/conda config --add channels conda-forge

COPY ../serveur_calcul_python/environment.yml .


RUN npm install -g npm@11.0.0
RUN npm install
RUN npm install -g nodemon typescript ts-node

# Créer l'environnement Conda
RUN /opt/conda/bin/conda env create -f environment.yml
SHELL ["/opt/conda/bin/conda", "run", "-n", "serveur_calcul_python", "/bin/bash", "-c"]

COPY serveur ./
WORKDIR /app
COPY serveur_calcul_python ./serveur_calcul_python

# Return to /app/serveur
WORKDIR /app/serveur

RUN npm run build
EXPOSE 5000 9229 5678

CMD ["nodemon", "dist/serveur.js"]