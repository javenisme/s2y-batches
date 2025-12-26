/**
 * UserProfileForm - Form for collecting user profile for risk assessment
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import type { UserProfile } from '../types';

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  loading?: boolean;
}

const COMMON_CONDITIONS = [
  'Diabetes',
  'Heart Disease',
  'Asthma',
  'Immunocompromised',
  'Hypertension',
  'Obesity',
];

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSubmit, loading = false }) => {
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState<string>('U');
  const [preExistingConditions, setPreExistingConditions] = useState<string[]>([]);
  const [previousCovidInfection, setPreviousCovidInfection] = useState(false);
  const [doseNumber, setDoseNumber] = useState<number>(1);

  const handleConditionToggle = (condition: string) => {
    setPreExistingConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: UserProfile = {
      age,
      sex,
      pre_existing_conditions: preExistingConditions.length > 0 ? preExistingConditions : undefined,
      previous_covid_infection: previousCovidInfection,
      dose_number: doseNumber,
    };

    onSubmit(profile);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Age"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            inputProps={{ min: 0, max: 120 }}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            required
          >
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
            <MenuItem value="U">Prefer not to say</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Dose Number"
            value={doseNumber}
            onChange={(e) => setDoseNumber(Number(e.target.value))}
            inputProps={{ min: 1, max: 5 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box>
            <TextField
              label="Pre-existing Conditions"
              value=""
              fullWidth
              disabled
              helperText="Select from common conditions below"
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COMMON_CONDITIONS.map((condition) => (
                <Chip
                  key={condition}
                  label={condition}
                  onClick={() => handleConditionToggle(condition)}
                  color={preExistingConditions.includes(condition) ? 'primary' : 'default'}
                  variant={preExistingConditions.includes(condition) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={previousCovidInfection}
                onChange={(e) => setPreviousCovidInfection(e.target.checked)}
              />
            }
            label="I have had a previous COVID-19 infection"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate My Risk Score'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfileForm;
