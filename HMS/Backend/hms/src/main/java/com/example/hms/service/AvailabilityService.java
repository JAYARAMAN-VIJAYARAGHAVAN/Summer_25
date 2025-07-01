package com.example.hms.service;

import com.example.hms.dto.AvailabilityRequest;
import com.example.hms.dto.AvailabilityResponse;
import com.example.hms.dto.SlotDTO;
import com.example.hms.dto.TimeRangeDTO;
import com.example.hms.entity.Appointment;
import com.example.hms.entity.Availability;
import com.example.hms.entity.Availability.TimeRange;
import com.example.hms.entity.Doctor;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.AvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository, AppointmentRepository appointmentRepository) {
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public boolean doctorHasAvailability(Long doctorId) {
        return availabilityRepository.existsByDoctorId(doctorId);
    }

    public Availability getAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId);
    }

    public AvailabilityResponse toAvailabilityResponse(Availability availability) {
        Map<DayOfWeek, TimeRangeDTO> scheduleDto = availability.getWeeklySchedule().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> new TimeRangeDTO(e.getValue().getStartTime(), e.getValue().getEndTime())
            ));

        return new AvailabilityResponse(
            availability.getDoctor().getId(),
            scheduleDto,
            availability.getUnavailableSlots()
        );
    }

    public void cleanExpiredUnavailableSlots(Availability availability) {
        Set<LocalDateTime> valid = availability.getUnavailableSlots().stream()
            .filter(dt -> dt.isAfter(LocalDateTime.now()))
            .collect(Collectors.toSet());
        availability.setUnavailableSlots(valid);
        availabilityRepository.save(availability);
    }

    public void cleanAllExpiredUnavailableSlots() {
        List<Availability> all = availabilityRepository.findAll();
        all.forEach(this::cleanExpiredUnavailableSlots);
    }

    public Availability saveAvailability(AvailabilityRequest request, Doctor doctor) {
        Map<DayOfWeek, TimeRange> schedule = request.getWeeklySchedule().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> new TimeRange(entry.getValue().getStartTime(), entry.getValue().getEndTime())
            ));

        Availability availability = Availability.builder()
            .doctor(doctor)
            .weeklySchedule(schedule)
            .unavailableSlots(request.getUnavailableSlots())
            .build();

        return availabilityRepository.save(availability);
    }

    public List<String> getAvailableSlots(Long doctorId, String dateString) {
        LocalDate date = LocalDate.parse(dateString);
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        Availability availability = availabilityRepository.findByDoctorId(doctorId);
        if (availability == null) throw new RuntimeException("Availability not set");

        cleanExpiredUnavailableSlots(availability);

        TimeRange range = availability.getWeeklySchedule().get(dayOfWeek);
        if (range == null) return List.of();

        LocalTime start = range.getStartTime();
        LocalTime end = range.getEndTime();

        List<LocalDateTime> unavailable = availability.getUnavailableSlots().stream()
            .filter(dt -> dt.toLocalDate().equals(date))
            .toList();

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndStartTimeBetween(
            doctorId,
            date.atStartOfDay(),
            date.atTime(23, 59)
        );

        Set<LocalDateTime> occupied = new HashSet<>();
        for (Appointment appt : appointments) {
            if (appt.getStatus() != Appointment.Status.CANCELLED) {
                LocalDateTime t = appt.getStartTime();
                while (t.isBefore(appt.getEndTime())) {
                    occupied.add(t);
                    t = t.plusMinutes(30);
                }
            }
        }

        List<String> availableSlots = new ArrayList<>();
        LocalDateTime slotTime = date.atTime(start);
        while (!slotTime.isAfter(date.atTime(end.minusMinutes(30)))) {
            if (!unavailable.contains(slotTime) && !occupied.contains(slotTime)) {
                availableSlots.add(slotTime.toLocalTime().toString());
            }
            slotTime = slotTime.plusMinutes(30);
        }

        return availableSlots;
    }

    public List<SlotDTO> getAllSlotsWithStatus(Long doctorId, LocalDate date) {
        Availability availability = availabilityRepository.findByDoctorId(doctorId);
        if (availability == null) return List.of();

        TimeRange timeRange = availability.getWeeklySchedule().get(date.getDayOfWeek());
        if (timeRange == null) return List.of();

        LocalTime start = timeRange.getStartTime();
        LocalTime end = timeRange.getEndTime();

        List<SlotDTO> allSlots = new ArrayList<>();
        for (LocalTime time = start; time.isBefore(end); time = time.plusMinutes(30)) {
            allSlots.add(new SlotDTO(time.toString(), "AVAILABLE"));
        }

        Set<LocalDateTime> unavailable = availability.getUnavailableSlots();
        List<Appointment> booked = appointmentRepository.findByDoctorIdAndDate(doctorId, date);

        System.out.println("Doctor " + doctorId + " has " + booked.size() + " appointments on " + date);

        for (Appointment appt : booked) {
            System.out.println("Appointment: " + appt.getStartTime() + " to " + appt.getEndTime() + " Status: " + appt.getStatus());
        }

        for (SlotDTO slot : allSlots) {
            LocalDateTime slotDT = LocalDateTime.of(date, LocalTime.parse(slot.getTime()));
            boolean isUnavailable = unavailable.contains(slotDT);
            boolean isBooked = booked.stream().anyMatch(appt ->
                !appt.getStatus().equals(Appointment.Status.CANCELLED) &&
                !slotDT.isBefore(appt.getStartTime()) &&
                slotDT.isBefore(appt.getEndTime())
            );

            if (isUnavailable || isBooked) {
                System.out.println("Marking " + slotDT + " as BOOKED");
                slot.setStatus("BOOKED");
            }
        }

        return allSlots;
    }

}
