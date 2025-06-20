import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTeam } from '@/context/team-context'

/**
 * Component that handles automatic navigation when teams are switched.
 * Must be rendered within the router context to use useNavigate.
 */
export function TeamNavigationHandler() {
  const navigate = useNavigate()
  const { selectedTeam, selectedEntity, setNavigationContext } = useTeam()
  const previousTeamRef = useRef<string>(selectedTeam)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    const previousTeam = previousTeamRef.current
    const isTeamSwitch = !isInitialLoadRef.current && previousTeam !== selectedTeam

    // Handle automatic navigation when team switches or entity is auto-selected
    if (isTeamSwitch || (!isInitialLoadRef.current && selectedEntity)) {
      setNavigationContext('direct') // Set context to direct since this is team-based navigation

      switch (selectedTeam) {
        case 'RPAY Analytics':
          if (isTeamSwitch) {
            navigate({ to: '/' })
          }
          break
        case 'RPAY Merchant':
          if (selectedEntity) {
            navigate({ to: `/merchants/${selectedEntity}` })
          }
          break
        case 'RPAY Branch':
          if (selectedEntity) {
            navigate({ to: `/branches/${selectedEntity}` })
          }
          break
      }
    }

    // Update refs
    previousTeamRef.current = selectedTeam
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
    }
  }, [selectedTeam, selectedEntity, navigate, setNavigationContext])

  // This component doesn't render anything
  return null
}
