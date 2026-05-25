import type {NextConfig} from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },
}

export default config
