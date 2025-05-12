use env_file_reader::read_file;
use tracing::info;

pub struct Config {
    pub database_url: String,
    pub hmac_key: String,
}

impl Config {
    #[tracing::instrument]
    pub fn from_env() -> Config {
        let path = ".env";
        info!("Reading environment from {path}");

        let env_variables = read_file(&path).unwrap();

        let database_url: String = env_variables["DATABASE_URL"].clone();
        let hmac_key: String = env_variables["HMAC_KEY"].clone();

        info!("Configuration read");

        Config {
            database_url,
            hmac_key,
        }
    }
}
