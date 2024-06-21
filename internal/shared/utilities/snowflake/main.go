package snowflake

import "github.com/godruoyi/go-snowflake"

func SetSnowflakeMachineId(machineId uint16) {
	snowflake.SetMachineID(machineId)
}
func NextId() uint64 {
	return snowflake.ID()
}
