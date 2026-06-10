import type {NextConfig} from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
    // 90 keeps the small log-row screenshot previews crisp (fine UI text softens
    // at the default 75); Next 16 requires every quality used to be whitelisted.
    qualities: [75, 90],
  },
}

export default config
