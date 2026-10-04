# claude-skills
## Google Maps Scraper

Vendored from [mahanaicoach/google-maps-scraper-kit](https://github.com/mahanaicoach/google-maps-scraper-kit) (MIT) into `google-maps-scraper-kit/`.
The `google-maps-scraper` skill and `/scrape`, `/scrape-batch`, `/scrape-setup`, `/scrape-jobs` commands live in `.claude/`.

Requires Docker. Start the engine from the repo root:

```bash
docker compose -f google-maps-scraper-kit/docker-compose.yml up -d
python3 google-maps-scraper-kit/scripts/scrape.py "coffee shops in Austin TX" --city "Austin, TX" --depth 5
```
