pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('jobportal-backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t venom45/jobportal-backend:latest jobportal-backend'
                sh 'docker build -t venom45/jobportal-frontend:latest jobportal-frontend'
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                    sh 'docker push venom45/jobportal-backend:latest'
                    sh 'docker push venom45/jobportal-frontend:latest'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    docker pull venom45/jobportal-backend:latest
                    docker pull venom45/jobportal-frontend:latest

                    docker rm -f jobportal-backend-container || true
                    docker rm -f jobportal-frontend-container || true

                    docker run -d \
                      --name jobportal-backend-container \
                      --network jobportal-network \
                      -p 8081:8080 \
                      -e SPRING_MONGODB_URI=mongodb://jobportal-mongodb:27017/jobportal \
                      venom45/jobportal-backend:latest

                    docker run -d \
                      --name jobportal-frontend-container \
                      -p 3000:80 \
                      venom45/jobportal-frontend:latest

                    docker ps
                '''
            }
        }
    }

    post {
        success {
            echo 'JobPortal CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}